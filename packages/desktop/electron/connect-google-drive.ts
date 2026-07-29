import { safeStorage, shell } from 'electron';
import { createHash, randomBytes } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import {
  GOOGLE_DRIVE_SCOPES,
  GoogleDriveAuthorizationError,
  GoogleDriveClient,
  type DriveAccount,
} from '@schdk/google-drive';
import { canPersistToken } from './can-persist-token.js';
import { legacyTokenPath } from './legacy-token-path.js';
import { tokenPath } from './token-path.js';
import { clientId } from './client-id.js';
import { clientSecret } from './client-secret.js';
import { requestTokens } from './request-tokens.js';
import { googleDriveAuthState } from './google-drive-auth-state.js';
import { getGoogleDriveAccessToken } from './google-drive-auth.js';

const AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

const CALLBACK_PATH = '/oauth2/callback';

async function persistRefreshToken(refreshToken: string) {
  if (!canPersistToken()) return;
  await rm(legacyTokenPath(), { force: true });
  await writeFile(tokenPath(), safeStorage.encryptString(refreshToken));
}

async function receiveAuthorizationCode(state: string, verifier: string) {
  return new Promise<{ code: string; redirectUri: string }>(
    (resolve, reject) => {
      let settled = false;
      const finish = (error?: Error, code?: string, redirectUri?: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        server.close();
        if (error) reject(error);
        else resolve({ code: code!, redirectUri: redirectUri! });
      };
      const server = createServer((request, response) => {
        const address = server.address();
        const redirectUri =
          typeof address === 'object' && address
            ? `http://127.0.0.1:${address.port}${CALLBACK_PATH}`
            : '';
        const url = new URL(request.url ?? '/', 'http://127.0.0.1');
        if (
          request.method !== 'GET' ||
          url.pathname !== CALLBACK_PATH ||
          url.searchParams.get('state') !== state ||
          !url.searchParams.get('code')
        ) {
          response.writeHead(400).end('Google Drive authorization failed.');
          finish(new GoogleDriveAuthorizationError('Invalid OAuth callback'));
          return;
        }
        response
          .writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
          .end('SCHDK is connected to Google Drive. You can close this tab.');
        finish(undefined, url.searchParams.get('code')!, redirectUri);
      });
      const timeout = setTimeout(
        () =>
          finish(
            new GoogleDriveAuthorizationError('Google authorization timed out'),
          ),
        120_000,
      );
      server.once('error', (error) => finish(error));
      server.listen(0, '127.0.0.1', async () => {
        const address = server.address();
        if (typeof address !== 'object' || !address) return;
        const redirectUri = `http://127.0.0.1:${address.port}${CALLBACK_PATH}`;
        const authorizationUrl = new URL(AUTHORIZATION_ENDPOINT);
        authorizationUrl.search = new URLSearchParams({
          access_type: 'offline',
          client_id: clientId!,
          code_challenge: createHash('sha256')
            .update(verifier)
            .digest('base64url'),
          code_challenge_method: 'S256',
          prompt: 'consent',
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: GOOGLE_DRIVE_SCOPES.join(' '),
          state,
        }).toString();
        try {
          await shell.openExternal(authorizationUrl.toString());
        } catch (error) {
          finish(error as Error);
        }
      });
    },
  );
}

export async function connectGoogleDrive(): Promise<DriveAccount> {
  if (!clientId || !clientSecret) {
    throw new GoogleDriveAuthorizationError(
      'Google Drive desktop client is not configured',
    );
  }
  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(64).toString('base64url');
  const { code, redirectUri } = await receiveAuthorizationCode(state, verifier);
  const result = await requestTokens(
    new URLSearchParams({
      client_id: clientId,
      code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  );
  const refreshToken =
    result.refresh_token ?? googleDriveAuthState.tokens?.refreshToken;
  if (!refreshToken) {
    throw new GoogleDriveAuthorizationError('No refresh token received');
  }
  googleDriveAuthState.tokens = {
    accessToken: result.access_token!,
    expiresAt: Date.now() + (result.expires_in ?? 3600) * 1000,
    refreshToken,
  };
  await persistRefreshToken(refreshToken);
  return new GoogleDriveClient(getGoogleDriveAccessToken).getAccount();
}

import { app, safeStorage, shell } from 'electron';
import { createHash, randomBytes } from 'node:crypto';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join } from 'node:path';
import {
  GOOGLE_DRIVE_SCOPES,
  GoogleDriveAuthorizationError,
  GoogleDriveClient,
  type DriveAccount,
} from '@schdk/google-drive';
import { loadGoogleDesktopClientSecret } from './google-oauth-client-secret.js';

const AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const REVOCATION_ENDPOINT = 'https://oauth2.googleapis.com/revoke';
const CALLBACK_PATH = '/oauth2/callback';
const DEFAULT_CLIENT_ID =
  '177890331671-ocg76dk71d5bd9kurbns07c4gauuh8vl.apps.googleusercontent.com';
const clientId =
  process.env.GOOGLE_DESKTOP_CLIENT_ID?.trim() || DEFAULT_CLIENT_ID;
const clientSecret = loadGoogleDesktopClientSecret();

interface OAuthTokens {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
}

let tokens: OAuthTokens | undefined;
let storedRefreshTokenLoaded = false;

const tokenPath = () =>
  join(app.getPath('userData'), 'google-drive-refresh-token-v2.bin');
const legacyTokenPath = () =>
  join(app.getPath('userData'), 'google-drive-refresh-token.bin');

function canPersistToken() {
  return (
    safeStorage.isEncryptionAvailable() &&
    !(
      process.platform === 'linux' &&
      safeStorage.getSelectedStorageBackend() === 'basic_text'
    )
  );
}

async function loadRefreshToken() {
  if (storedRefreshTokenLoaded) return tokens?.refreshToken;
  storedRefreshTokenLoaded = true;
  if (!canPersistToken()) return undefined;
  await rm(legacyTokenPath(), { force: true });
  try {
    const refreshToken = safeStorage.decryptString(await readFile(tokenPath()));
    if (refreshToken) {
      tokens = { accessToken: '', expiresAt: 0, refreshToken };
      return refreshToken;
    }
  } catch {
    // Missing or unreadable credentials require reconnecting.
  }
  return undefined;
}

async function persistRefreshToken(refreshToken: string) {
  if (!canPersistToken()) return;
  await rm(legacyTokenPath(), { force: true });
  await writeFile(tokenPath(), safeStorage.encryptString(refreshToken));
}

async function requestTokens(parameters: URLSearchParams) {
  parameters.set('client_secret', clientSecret);
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: parameters,
  });
  const value = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
    expires_in?: number;
    refresh_token?: string;
  };
  if (!response.ok || !value.access_token) {
    throw new GoogleDriveAuthorizationError(
      [value.error, value.error_description].filter(Boolean).join(': ') ||
        'Google authorization failed',
    );
  }
  return value;
}

export async function getGoogleDriveAccessToken() {
  if (!clientId || !clientSecret) {
    throw new GoogleDriveAuthorizationError(
      'Google Drive desktop client is not configured',
    );
  }
  if (tokens?.accessToken && Date.now() < tokens.expiresAt - 60_000) {
    return tokens.accessToken;
  }
  const refreshToken = tokens?.refreshToken ?? (await loadRefreshToken());
  if (!refreshToken) {
    throw new GoogleDriveAuthorizationError('Google Drive is disconnected');
  }
  const refreshed = await requestTokens(
    new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  );
  tokens = {
    accessToken: refreshed.access_token!,
    expiresAt: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
    refreshToken,
  };
  return tokens.accessToken;
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
  const refreshToken = result.refresh_token ?? tokens?.refreshToken;
  if (!refreshToken) {
    throw new GoogleDriveAuthorizationError('No refresh token received');
  }
  tokens = {
    accessToken: result.access_token!,
    expiresAt: Date.now() + (result.expires_in ?? 3600) * 1000,
    refreshToken,
  };
  await persistRefreshToken(refreshToken);
  return new GoogleDriveClient(getGoogleDriveAccessToken).getAccount();
}

export async function disconnectGoogleDrive() {
  const token = tokens?.accessToken || tokens?.refreshToken;
  tokens = undefined;
  storedRefreshTokenLoaded = true;
  await Promise.all([
    rm(tokenPath(), { force: true }),
    rm(legacyTokenPath(), { force: true }),
  ]);
  if (token) {
    await fetch(`${REVOCATION_ENDPOINT}?${new URLSearchParams({ token })}`, {
      method: 'POST',
    }).catch(() => undefined);
  }
}

export async function getGoogleDriveStatus() {
  if (!clientId || !clientSecret) return { state: 'unavailable' } as const;
  try {
    const account = await new GoogleDriveClient(
      getGoogleDriveAccessToken,
    ).getAccount();
    return { state: 'connected', account } as const;
  } catch (error) {
    if (error instanceof GoogleDriveAuthorizationError) {
      return { state: 'disconnected' } as const;
    }
    throw error;
  }
}

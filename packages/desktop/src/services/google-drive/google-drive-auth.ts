import { safeStorage } from 'electron';
import { readFile, rm } from 'node:fs/promises';
import { GoogleDriveAuthorizationError } from '@schdk/google-drive';
import { googleDriveAuthState } from './google-drive-auth-state.js';
import { canPersistToken } from './can-persist-token.js';
import { legacyTokenPath } from './legacy-token-path.js';
import { tokenPath } from './token-path.js';
import { clientId } from './client-id.js';
import { clientSecret } from './client-secret.js';
import { OAuthTokenError, requestTokens } from './request-tokens.js';
import { connectGoogleDrive } from './connect-google-drive.js';
import { disconnectGoogleDrive } from './disconnect-google-drive.js';
import { getGoogleDriveStatus } from './get-google-drive-status.js';

async function loadRefreshToken() {
  if (googleDriveAuthState.storedRefreshTokenLoaded) {
    return googleDriveAuthState.tokens?.refreshToken;
  }
  googleDriveAuthState.storedRefreshTokenLoaded = true;
  if (!canPersistToken()) return undefined;
  await rm(legacyTokenPath(), { force: true });
  try {
    const refreshToken = safeStorage.decryptString(await readFile(tokenPath()));
    if (refreshToken) {
      googleDriveAuthState.tokens = {
        accessToken: '',
        expiresAt: 0,
        refreshToken,
      };
      return refreshToken;
    }
  } catch {
    // Missing or unreadable credentials require reconnecting.
  }
  return undefined;
}

async function getGoogleDriveAccessToken() {
  if (!clientId || !clientSecret) {
    throw new GoogleDriveAuthorizationError(
      'Google Drive desktop client is not configured',
    );
  }
  if (
    googleDriveAuthState.tokens?.accessToken &&
    Date.now() < googleDriveAuthState.tokens.expiresAt - 60_000
  ) {
    return googleDriveAuthState.tokens.accessToken;
  }
  const refreshToken =
    googleDriveAuthState.tokens?.refreshToken ?? (await loadRefreshToken());
  if (!refreshToken) {
    throw new GoogleDriveAuthorizationError('Google Drive is disconnected');
  }
  const refreshed = await requestTokens(
    new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  ).catch(async (error: unknown) => {
    if (error instanceof OAuthTokenError && error.code === 'invalid_grant') {
      await disconnectGoogleDrive();
    }
    throw error;
  });
  googleDriveAuthState.tokens = {
    accessToken: refreshed.access_token!,
    expiresAt: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
    refreshToken,
  };
  return googleDriveAuthState.tokens.accessToken;
}

export {
  getGoogleDriveAccessToken,
  connectGoogleDrive,
  disconnectGoogleDrive,
  getGoogleDriveStatus,
};

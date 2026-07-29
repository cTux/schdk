import { rm } from 'node:fs/promises';
import { googleDriveAuthState } from './google-drive-auth-state.js';
import { tokenPath } from './token-path.js';
import { legacyTokenPath } from './legacy-token-path.js';

const REVOCATION_ENDPOINT = 'https://oauth2.googleapis.com/revoke';

export async function disconnectGoogleDrive() {
  const token =
    googleDriveAuthState.tokens?.accessToken ||
    googleDriveAuthState.tokens?.refreshToken;
  googleDriveAuthState.tokens = undefined;
  googleDriveAuthState.storedRefreshTokenLoaded = true;
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

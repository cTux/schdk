import { type StoredGoogleDriveToken } from './stored-google-drive-token';
import { TOKEN_KEY } from './token-key';
import { clearStoredGoogleDriveToken } from './google-drive-token-storage';

export function loadStoredGoogleDriveToken(
  clientId: string,
): StoredGoogleDriveToken | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(TOKEN_KEY) ?? 'null',
    ) as Partial<StoredGoogleDriveToken> | null;
    if (
      value &&
      typeof value.accessToken === 'string' &&
      value.accessToken.length > 0 &&
      value.accessToken.length <= 4096 &&
      value.clientId === clientId &&
      typeof value.expiresAt === 'number' &&
      Number.isFinite(value.expiresAt) &&
      value.expiresAt > Date.now()
    ) {
      return value as StoredGoogleDriveToken;
    }
  } catch {
    // Invalid or unavailable storage behaves like a signed-out session.
  }
  clearStoredGoogleDriveToken();
  return null;
}

import { type StoredGoogleDriveToken } from '../../types/google-drive/stored-google-drive-token';
import { TOKEN_KEY } from '../../constants/google-drive/token-key';
import { clearStoredGoogleDriveToken } from './google-drive-token-storage';

export function loadStoredGoogleDriveToken(
  clientId: string,
): StoredGoogleDriveToken | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(TOKEN_KEY) ?? 'null',
    ) as Partial<StoredGoogleDriveToken> | null;
    const hasValidAccessToken =
      !!value &&
      typeof value.accessToken === 'string' &&
      value.accessToken.length > 0 &&
      value.accessToken.length <= 4096;
    const hasExpectedClient = value?.clientId === clientId;
    const hasValidExpiry =
      !!value &&
      typeof value.expiresAt === 'number' &&
      Number.isFinite(value.expiresAt) &&
      value.expiresAt > Date.now();
    if (hasValidAccessToken && hasExpectedClient && hasValidExpiry) {
      return value as StoredGoogleDriveToken;
    }
  } catch {
    // Invalid or unavailable storage behaves like a signed-out session.
  }
  clearStoredGoogleDriveToken();
  return null;
}

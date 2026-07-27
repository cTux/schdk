export interface StoredGoogleDriveToken {
  accessToken: string;
  clientId: string;
  expiresAt: number;
}

const TOKEN_KEY = 'schdk:google-drive-token-v2';
const LEGACY_TOKEN_KEY = 'schdk:google-drive-token';

export function clearStoredGoogleDriveToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // The in-memory token still works when session storage is unavailable.
  }
}

export function clearLegacyGoogleDriveToken() {
  try {
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // Unavailable storage already behaves like a signed-out legacy session.
  }
}

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

export function storeGoogleDriveToken(token: StoredGoogleDriveToken) {
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  } catch {
    // The access token remains usable in memory for the current page.
  }
}

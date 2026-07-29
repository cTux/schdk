const LEGACY_TOKEN_KEY = 'schdk:google-drive-token';

export function clearLegacyGoogleDriveToken() {
  try {
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // Unavailable storage already behaves like a signed-out legacy session.
  }
}

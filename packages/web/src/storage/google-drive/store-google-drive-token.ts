import { type StoredGoogleDriveToken } from '../../types/google-drive/stored-google-drive-token';
import { TOKEN_KEY } from '../../constants/google-drive/token-key';

export function storeGoogleDriveToken(token: StoredGoogleDriveToken) {
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  } catch {
    // The access token remains usable in memory for the current page.
  }
}

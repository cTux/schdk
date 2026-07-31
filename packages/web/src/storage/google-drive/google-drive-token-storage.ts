import { TOKEN_KEY } from '../../constants/google-drive/token-key';
import { type StoredGoogleDriveToken } from '../../types/google-drive/stored-google-drive-token';
import { clearLegacyGoogleDriveToken } from '../../utils/google-drive/clear-legacy-google-drive-token';
import { loadStoredGoogleDriveToken } from './load-stored-google-drive-token';
import { storeGoogleDriveToken } from './store-google-drive-token';

function clearStoredGoogleDriveToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // The in-memory token still works when session storage is unavailable.
  }
}

export {
  type StoredGoogleDriveToken,
  clearStoredGoogleDriveToken,
  clearLegacyGoogleDriveToken,
  loadStoredGoogleDriveToken,
  storeGoogleDriveToken,
};

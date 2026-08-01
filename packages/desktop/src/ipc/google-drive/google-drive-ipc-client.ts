import { GoogleDriveClient } from '@schdk/google-drive';
import { getGoogleDriveAccessToken } from '../../services/google-drive/google-drive-auth.js';

export const googleDriveClient = new GoogleDriveClient(
  getGoogleDriveAccessToken,
);

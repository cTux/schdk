import {
  GoogleDriveAuthorizationError,
  GoogleDriveClient,
} from '@schdk/google-drive';
import { clientId } from './client-id.js';
import { clientSecret } from './client-secret.js';
import { getGoogleDriveAccessToken } from './google-drive-auth.js';

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

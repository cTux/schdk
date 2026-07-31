import type { useLocalization } from '../../../localization';
import type { GoogleDriveState } from '../types';

export function getGoogleDriveMessage(
  state: GoogleDriveState,
  account: string | undefined,
  copy: ReturnType<typeof useLocalization>['copy'],
) {
  if (state === 'unavailable') return copy.settings.googleDriveUnavailable;
  if (state === 'connecting') return copy.settings.googleDriveConnecting;
  if (state === 'connected')
    return copy.settings.googleDriveConnected(account ?? '');
  if (state === 'reauthorization-required')
    return copy.settings.googleDriveReconnect;
  if (state === 'error') return copy.settings.googleDriveError;
  return copy.settings.googleDriveDisconnected;
}

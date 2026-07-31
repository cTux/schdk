import type { GoogleDriveState } from '../../options/OptionsPage';

export interface GoogleLoginViewProps {
  privacyHref?: string;
  state: GoogleDriveState;
  onConnect(): void;
}

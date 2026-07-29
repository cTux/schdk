import type { GoogleDriveState } from '../../options/OptionsPage';

export interface GoogleLoginViewProps {
  state: GoogleDriveState;
  onConnect(): void;
}

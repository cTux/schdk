import type { AppTheme, EditorTextOptions, GameOptions } from '../types';

export type GoogleDriveState =
  | 'unavailable'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reauthorization-required'
  | 'error';

export interface OptionsPageProps {
  editor: EditorTextOptions;
  game: GameOptions;
  googleDriveAccount?: string;
  googleDriveState: GoogleDriveState;
  hidden: boolean;
  theme: AppTheme;
  onEditorChange(options: EditorTextOptions): void;
  onGameChange(options: GameOptions): void;
  onGoogleDriveConnect(): void;
  onGoogleDriveDisconnect(): void;
  onThemeChange(theme: AppTheme): void;
}

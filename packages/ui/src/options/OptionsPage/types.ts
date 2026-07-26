import type {
  AiOptions,
  AiProvider,
  AppTheme,
  EditorTextOptions,
  GameOptions,
} from '../types';

export type GoogleDriveState =
  | 'unavailable'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reauthorization-required'
  | 'error';

export interface OptionsPageProps {
  ai: AiOptions;
  editor: EditorTextOptions;
  game: GameOptions;
  googleDriveAccount?: string;
  googleDriveState: GoogleDriveState;
  hidden: boolean;
  theme: AppTheme;
  onAiApiKeySave(apiKey: string | null): Promise<void>;
  onAiModelChange(model: string): void;
  onAiProviderChange(provider: AiProvider): void;
  onEditorChange(options: EditorTextOptions): void;
  onGameChange(options: GameOptions): void;
  onGoogleDriveConnect(): void;
  onGoogleDriveDisconnect(): void;
  onThemeChange(theme: AppTheme): void;
}

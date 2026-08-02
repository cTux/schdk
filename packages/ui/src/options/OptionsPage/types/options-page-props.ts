import type {
  AiOptions,
  AppFont,
  AppTheme,
  EditorTextOptions,
  GameOptions,
  SettingsGroup,
} from '../../types';
import { type GoogleDriveState } from '../types';

export interface OptionsPageProps {
  ai: AiOptions;
  editor: EditorTextOptions;
  game: GameOptions;
  googleDriveAccount?: string;
  googleDriveState: GoogleDriveState;
  hidden: boolean;
  settingsGroup: SettingsGroup;
  font: AppFont;
  theme: AppTheme;
  uiAnimations: boolean;
  onAiApiKeySave(apiKey: string | null): Promise<void>;
  onAiModelChange(model: string): void;
  onAiProviderChange(provider: string): void;
  onBack(): void;
  onEditorChange(options: EditorTextOptions): void;
  onGameChange(options: GameOptions): void;
  onGoogleDriveConnect(): void;
  onGoogleDriveDisconnect(): void;
  onSettingsGroupChange(group: SettingsGroup): void;
  onFontChange(font: AppFont): void;
  onThemeChange(theme: AppTheme): void;
  onUiAnimationsChange(enabled: boolean): void;
}

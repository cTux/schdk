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
  hidden: boolean;
  artificialIntelligence: {
    options: AiOptions;
    onApiKeySave(apiKey: string | null): Promise<void>;
    onModelChange(model: string): void;
    onProviderChange(provider: string): void;
  };
  application: {
    font: AppFont;
    googleDriveAccount?: string;
    googleDriveState: GoogleDriveState;
    theme: AppTheme;
    uiAnimations: boolean;
    onFontChange(font: AppFont): void;
    onGoogleDriveConnect(): void;
    onGoogleDriveDisconnect(): void;
    onThemeChange(theme: AppTheme): void;
    onUiAnimationsChange(enabled: boolean): void;
  };
  navigation: {
    settingsGroup: SettingsGroup;
    onBack(): void;
    onSettingsGroupChange(group: SettingsGroup): void;
  };
  schdk: {
    editor: EditorTextOptions;
    game: GameOptions;
    onEditorChange(options: EditorTextOptions): void;
    onGameChange(options: GameOptions): void;
  };
}

import type { ReactNode } from 'react';
import type { ShellAccount } from '../ShellNavigation';
import type { ShellViewName } from '../shellItems';
import type { GoogleDriveState } from '../../options/OptionsPage';
import type {
  AiOptions,
  AppTheme,
  EditorTextOptions,
  GameOptions,
  SettingsGroup,
} from '../../options/types';
import type { AIQuestion, AIQuestionsPackage } from '@schdk/common';
import type { ShellEditTarget } from './types';
import type { QuestionDatabasePageProps } from '../QuestionDatabasePage';

export interface ShellViewProps {
  aiOptions: AiOptions;
  aiQuestions: {
    questions: AIQuestion[];
    globalQuestions: AIQuestion[];
    failed: boolean;
    globalFailed: boolean;
    loading: boolean;
    globalLoading: boolean;
    isGlobalAdmin: boolean;
    addQuestion(question: AIQuestion): Promise<boolean>;
    addGlobalQuestion(question: AIQuestion): Promise<boolean>;
    removeQuestion(index: number): Promise<boolean>;
    removeGlobalQuestion(index: number): Promise<boolean>;
    updateQuestion(index: number, question: AIQuestion): Promise<boolean>;
    updateGlobalQuestion(index: number, question: AIQuestion): Promise<boolean>;
  };
  aiQuestionsPackages: {
    packages: AIQuestionsPackage[];
    failed: boolean;
    loading: boolean;
    addPackage(item: AIQuestionsPackage): Promise<boolean>;
    removePackage(index: number): Promise<boolean>;
    updatePackage(index: number, item: AIQuestionsPackage): Promise<boolean>;
  };
  editTarget: ShellEditTarget | null;
  editorApp: ReactNode;
  hostApp: ReactNode;
  loadedViews: Partial<Record<ShellViewName, true>>;
  preloading: boolean;
  questionDatabase: Omit<QuestionDatabasePageProps, 'hidden'>;
  editorOptions: EditorTextOptions;
  gameOptions: GameOptions;
  gameOptionsError: string;
  googleDriveAccount?: ShellAccount;
  googleDriveState: GoogleDriveState;
  settingsGroup: SettingsGroup;
  theme: AppTheme;
  view: ShellViewName;
  onAiApiKeySave(apiKey: string | null): Promise<void>;
  onAiModelChange(model: string): void;
  onAiProviderChange(provider: string): void;
  onEditorOptionsChange(options: EditorTextOptions): void;
  onGameOptionsChange(options: GameOptions): void;
  onGoogleDriveConnect(): void;
  onGoogleDriveDisconnect(): void;
  onImportVisualEditorTemplate(file: File): void;
  onExportVisualEditorTemplate(): void;
  onCloseEditor(): void;
  onShowEditor(target: ShellEditTarget): void;
  onShowView(view: ShellViewName): void;
  onSettingsGroupChange(group: SettingsGroup): void;
  onThemeChange(theme: AppTheme): void;
}

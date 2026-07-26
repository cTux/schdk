import './styles.scss';

import type { ReactNode } from 'react';
import { ShellHome } from '../ShellHome';
import { ShellNavigation } from '../ShellNavigation';
import type { ShellAccount } from '../ShellNavigation';
import type { ShellViewName } from '../shellItems';
import { OptionsPage } from '../../options/OptionsPage';
import type { GoogleDriveState } from '../../options/OptionsPage';
import type {
  AiOptions,
  AppTheme,
  EditorTextOptions,
  GameOptions,
  SettingsGroup,
} from '../../options/types';
import { VisualEditor } from '../../visual-editor/VisualEditor';
import { TooltipProvider } from '../../atoms/Tooltip';

export type { ShellViewName } from '../shellItems';

export interface ShellViewProps {
  aiOptions: AiOptions;
  editorApp: ReactNode;
  hostApp: ReactNode;
  loadedApps: { host: boolean; editor: boolean };
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
  onShowView(view: ShellViewName): void;
  onSettingsGroupChange(group: SettingsGroup): void;
  onThemeChange(theme: AppTheme): void;
}

export function ShellView({
  aiOptions,
  editorApp,
  hostApp,
  loadedApps,
  editorOptions,
  gameOptions,
  gameOptionsError,
  googleDriveAccount,
  googleDriveState,
  settingsGroup,
  theme,
  view,
  onAiApiKeySave,
  onAiModelChange,
  onAiProviderChange,
  onEditorOptionsChange,
  onGameOptionsChange,
  onGoogleDriveConnect,
  onGoogleDriveDisconnect,
  onImportVisualEditorTemplate,
  onExportVisualEditorTemplate,
  onShowView,
  onSettingsGroupChange,
  onThemeChange,
}: ShellViewProps) {
  return (
    <TooltipProvider>
      <main className="app-shell" data-theme={theme}>
        <ShellNavigation
          account={googleDriveAccount}
          connected={googleDriveState === 'connected'}
          view={view}
          onSelect={onShowView}
        />
        <section className="workspace">
          <ShellHome hidden={view !== 'home'} onOpen={onShowView} />
          <OptionsPage
            ai={aiOptions}
            hidden={view !== 'options'}
            editor={editorOptions}
            game={gameOptions}
            googleDriveAccount={googleDriveAccount?.emailAddress}
            googleDriveState={googleDriveState}
            settingsGroup={settingsGroup}
            theme={theme}
            onAiApiKeySave={onAiApiKeySave}
            onAiModelChange={onAiModelChange}
            onAiProviderChange={onAiProviderChange}
            onEditorChange={onEditorOptionsChange}
            onGameChange={onGameOptionsChange}
            onGoogleDriveConnect={onGoogleDriveConnect}
            onGoogleDriveDisconnect={onGoogleDriveDisconnect}
            onSettingsGroupChange={onSettingsGroupChange}
            onThemeChange={onThemeChange}
          />
          <VisualEditor
            message={gameOptionsError}
            hidden={view !== 'visualEditor'}
            game={gameOptions}
            onChange={onGameOptionsChange}
            onImportTemplate={onImportVisualEditorTemplate}
            onExportTemplate={onExportVisualEditorTemplate}
          />
          <div hidden={view !== 'artificialIntelligence'} />
          {loadedApps.host && (
            <div className="embedded-app" hidden={view !== 'host'}>
              {hostApp}
            </div>
          )}
          {loadedApps.editor && (
            <div className="embedded-app" hidden={view !== 'editor'}>
              {editorApp}
            </div>
          )}
        </section>
      </main>
    </TooltipProvider>
  );
}

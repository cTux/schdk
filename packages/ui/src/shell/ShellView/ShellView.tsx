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
import { AIQuestionsPage } from '../AIQuestionsPage';
import { AIQuestionsPackagesPage } from '../AIQuestionsPackagesPage';
import type { AIQuestion, AIQuestionsPackage } from '@schdk/common';
import type { ShellEditTarget } from './types';

export type { ShellViewName } from '../shellItems';

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
  onCloseEditor(): void;
  onShowEditor(target: ShellEditTarget): void;
  onShowView(view: ShellViewName): void;
  onSettingsGroupChange(group: SettingsGroup): void;
  onThemeChange(theme: AppTheme): void;
}

export function ShellView({
  aiOptions,
  aiQuestions,
  aiQuestionsPackages,
  editTarget,
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
  onCloseEditor,
  onShowEditor,
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
          <div hidden={view !== 'artificialIntelligence'}>
            <AIQuestionsPage
              questions={aiQuestions.questions}
              globalQuestions={aiQuestions.globalQuestions}
              failed={aiQuestions.failed}
              globalFailed={aiQuestions.globalFailed}
              loading={aiQuestions.loading}
              globalLoading={aiQuestions.globalLoading}
              isGlobalAdmin={aiQuestions.isGlobalAdmin}
              onAdd={aiQuestions.addQuestion}
              onAddGlobal={aiQuestions.addGlobalQuestion}
              onRemove={aiQuestions.removeQuestion}
              onRemoveGlobal={aiQuestions.removeGlobalQuestion}
              editTarget={editTarget?.kind === 'question' ? editTarget : null}
              onCloseEditor={onCloseEditor}
              onShowEditor={onShowEditor}
              onUpdate={aiQuestions.updateQuestion}
              onUpdateGlobal={aiQuestions.updateGlobalQuestion}
            />
          </div>
          <div hidden={view !== 'packageRules'}>
            <AIQuestionsPackagesPage
              packages={aiQuestionsPackages.packages}
              questionRules={[
                ...aiQuestions.questions,
                ...aiQuestions.globalQuestions,
              ].filter((question) => question.enabled && !question.generalRule)}
              failed={aiQuestionsPackages.failed}
              loading={aiQuestionsPackages.loading}
              editTarget={editTarget?.kind === 'package' ? editTarget : null}
              onAdd={aiQuestionsPackages.addPackage}
              onCloseEditor={onCloseEditor}
              onRemove={aiQuestionsPackages.removePackage}
              onShowEditor={onShowEditor}
              onUpdate={aiQuestionsPackages.updatePackage}
            />
          </div>
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

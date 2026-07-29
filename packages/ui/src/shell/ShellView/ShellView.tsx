import './styles.scss';
import { ShellHome } from '../ShellHome';
import { ShellNavigation } from '../ShellNavigation';
import { OptionsPage } from '../../options/OptionsPage';
import { VisualEditor } from '../../visual-editor/VisualEditor';
import { TooltipProvider } from '../../atoms/Tooltip';
import { AIQuestionsPage } from '../AIQuestionsPage';
import { AIQuestionsPackagesPage } from '../AIQuestionsPackagesPage';
import { QuestionDatabasePage } from '../QuestionDatabasePage';
import type { ShellViewName } from '../shellItems';
import { type ShellViewProps } from './shell-view-props';

function ShellView({
  aiOptions,
  aiQuestions,
  aiQuestionsPackages,
  editTarget,
  editorApp,
  hostApp,
  loadedApps,
  questionDatabase,
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
          <QuestionDatabasePage
            {...questionDatabase}
            hidden={view !== 'questionDatabase'}
          />
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

export { type ShellViewName, type ShellViewProps, ShellView };

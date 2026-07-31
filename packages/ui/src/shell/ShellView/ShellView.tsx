import './styles.scss';
import { ShellNavigation } from '../ShellNavigation';
import { TooltipProvider } from '../../atoms/Tooltip';
import { lazy, Suspense } from 'react';
import type { ShellViewName } from '../shellItems';
import { type ShellViewProps } from './types/shell-view-props';

const ShellHome = lazy(() =>
  import('../ShellHome').then(({ ShellHome }) => ({ default: ShellHome })),
);
const QuestionDatabasePage = lazy(() =>
  import('../QuestionDatabasePage').then(({ QuestionDatabasePage }) => ({
    default: QuestionDatabasePage,
  })),
);
const OptionsPage = lazy(() =>
  import('../../options/OptionsPage').then(({ OptionsPage }) => ({
    default: OptionsPage,
  })),
);
const VisualEditor = lazy(() =>
  import('../../visual-editor/VisualEditor').then(({ VisualEditor }) => ({
    default: VisualEditor,
  })),
);
const AIQuestionsPage = lazy(() =>
  import('../AIQuestionsPage').then(({ AIQuestionsPage }) => ({
    default: AIQuestionsPage,
  })),
);
const AIQuestionsPackagesPage = lazy(() =>
  import('../AIQuestionsPackagesPage').then(({ AIQuestionsPackagesPage }) => ({
    default: AIQuestionsPackagesPage,
  })),
);
const DictionariesPage = lazy(() =>
  import('../DictionariesPage').then(({ DictionariesPage }) => ({
    default: DictionariesPage,
  })),
);

function ShellView({
  aiOptions,
  aiQuestions,
  aiQuestionsPackages,
  dictionaries,
  editTarget,
  editorApp,
  hostApp,
  loadedViews,
  preloading,
  questionDatabase,
  editorOptions,
  gameOptions,
  gameOptionsError,
  googleDriveAccount,
  googleDriveState,
  settingsGroup,
  theme,
  uiAnimations,
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
  onUiAnimationsChange,
}: ShellViewProps) {
  return (
    <TooltipProvider>
      <main className="app-shell" data-theme={theme}>
        <ShellNavigation
          preloading={preloading}
          view={view}
          onSelect={onShowView}
        />
        <section className="workspace">
          <Suspense fallback={null}>
            {loadedViews.home && (
              <ShellHome hidden={view !== 'home'} onOpen={onShowView} />
            )}
            {loadedViews.questionDatabase && (
              <QuestionDatabasePage
                {...questionDatabase}
                hidden={view !== 'questionDatabase'}
                onBack={() => onShowView('home')}
              />
            )}
            {loadedViews.options && (
              <OptionsPage
                ai={aiOptions}
                hidden={view !== 'options'}
                editor={editorOptions}
                game={gameOptions}
                googleDriveAccount={googleDriveAccount?.emailAddress}
                googleDriveState={googleDriveState}
                settingsGroup={settingsGroup}
                theme={theme}
                uiAnimations={uiAnimations}
                onBack={() => onShowView('home')}
                onAiApiKeySave={onAiApiKeySave}
                onAiModelChange={onAiModelChange}
                onAiProviderChange={onAiProviderChange}
                onEditorChange={onEditorOptionsChange}
                onGameChange={onGameOptionsChange}
                onGoogleDriveConnect={onGoogleDriveConnect}
                onGoogleDriveDisconnect={onGoogleDriveDisconnect}
                onSettingsGroupChange={onSettingsGroupChange}
                onThemeChange={onThemeChange}
                onUiAnimationsChange={onUiAnimationsChange}
              />
            )}
            {loadedViews.visualEditor && (
              <VisualEditor
                message={gameOptionsError}
                hidden={view !== 'visualEditor'}
                game={gameOptions}
                onChange={onGameOptionsChange}
                onImportTemplate={onImportVisualEditorTemplate}
                onExportTemplate={onExportVisualEditorTemplate}
              />
            )}
            {loadedViews.artificialIntelligence && (
              <AIQuestionsPage
                hidden={view !== 'artificialIntelligence'}
                questions={aiQuestions.questions}
                globalQuestions={aiQuestions.globalQuestions}
                failed={aiQuestions.failed}
                globalFailed={aiQuestions.globalFailed}
                loading={aiQuestions.loading}
                globalLoading={aiQuestions.globalLoading}
                isGlobalAdmin={aiQuestions.isGlobalAdmin}
                onAdd={aiQuestions.addQuestion}
                onAddGlobal={aiQuestions.addGlobalQuestion}
                onBack={() => onShowView('home')}
                onRemove={aiQuestions.removeQuestion}
                onRemoveGlobal={aiQuestions.removeGlobalQuestion}
                editTarget={editTarget?.kind === 'question' ? editTarget : null}
                onCloseEditor={onCloseEditor}
                onShowEditor={onShowEditor}
                onUpdate={aiQuestions.updateQuestion}
                onUpdateGlobal={aiQuestions.updateGlobalQuestion}
              />
            )}
            {loadedViews.packageRules && (
              <AIQuestionsPackagesPage
                hidden={view !== 'packageRules'}
                packages={aiQuestionsPackages.packages}
                questionRules={[
                  ...aiQuestions.questions,
                  ...aiQuestions.globalQuestions,
                ].filter(
                  (question) => question.enabled && !question.generalRule,
                )}
                failed={aiQuestionsPackages.failed}
                loading={aiQuestionsPackages.loading}
                editTarget={editTarget?.kind === 'package' ? editTarget : null}
                onAdd={aiQuestionsPackages.addPackage}
                onBack={() => onShowView('home')}
                onCloseEditor={onCloseEditor}
                onRemove={aiQuestionsPackages.removePackage}
                onShowEditor={onShowEditor}
                onUpdate={aiQuestionsPackages.updatePackage}
              />
            )}
            {loadedViews.dictionaries && (
              <DictionariesPage
                dictionaries={dictionaries.dictionaries}
                editId={
                  editTarget?.kind === 'dictionary' ? editTarget.id : null
                }
                failed={dictionaries.failed}
                hidden={view !== 'dictionaries'}
                isAdmin={dictionaries.isAdmin}
                loading={dictionaries.loading}
                onBack={() => onShowView('home')}
                onCloseEditor={onCloseEditor}
                onShowEditor={(id) => onShowEditor({ kind: 'dictionary', id })}
                onUpdate={dictionaries.updateDictionary}
              />
            )}
            {loadedViews.host && (
              <div className="embedded-app" hidden={view !== 'host'}>
                {hostApp}
              </div>
            )}
            {loadedViews.editor && (
              <div className="embedded-app" hidden={view !== 'editor'}>
                {editorApp}
              </div>
            )}
          </Suspense>
        </section>
      </main>
    </TooltipProvider>
  );
}

export { type ShellViewName, type ShellViewProps, ShellView };

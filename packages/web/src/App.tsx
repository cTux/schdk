import type { EditorTextOptions, GameOptions } from '@schdk/ui/options';
import { LOCALIZATION_COPY, LocaleProvider } from '@schdk/ui/localization';
import { GoogleLoginView, ShellView } from '@schdk/ui/shell';
import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import {
  loadEditorTextOptions,
  loadGameOptions,
  parseVisualEditorTemplateFile,
  saveEditorTextOptions,
  saveGameOptions,
  serializeVisualEditorTemplate,
} from './options-storage';
import {
  loadShellLocale,
  loadShellTheme,
  loadUiAnimations,
  saveShellLocale,
  saveShellTheme,
  saveUiAnimations,
} from './shell-preferences';
import { useAiQuestionTools } from './ai-question-generation';
import { AppUpdateButton } from './AppUpdateButton';
import { useGoogleDriveSettings } from './use-google-drive-settings';
import { useShellNavigation } from './use-shell-navigation';
import { useSettingsDeepLink } from './use-settings-deep-link';
import { useQuestionDatabase } from './use-question-database';

const HostApp = lazy(() =>
  import('./host/App').then(({ App }) => ({ default: App })),
);
const EditorApp = lazy(() =>
  import('./editor/App').then(({ App }) => ({ default: App })),
);

export function App() {
  const sessionScope = window.location.pathname;
  const [locale, setLocale] = useState(loadShellLocale);
  const [theme, setTheme] = useState(loadShellTheme);
  const [uiAnimations, setUiAnimations] = useState(loadUiAnimations);
  const copy = LOCALIZATION_COPY[locale];
  const navigation = useShellNavigation(sessionScope);
  const { view } = navigation;
  const settings = useSettingsDeepLink(view);
  const [editorOptions, setEditorOptionsState] = useState<EditorTextOptions>(
    () => loadEditorTextOptions(localStorage),
  );
  const [gameOptions, setGameOptionsState] = useState<GameOptions>(() =>
    loadGameOptions(localStorage),
  );
  const [gameOptionsError, setGameOptionsError] = useState('');
  const googleDrive = useGoogleDriveSettings({
    editorTextOptions: editorOptions,
    gameOptions,
    setEditorTextOptions: setEditorOptionsState,
    setGameOptions: setGameOptionsState,
  });
  const { connection } = googleDrive;
  const connected = connection.state === 'connected';
  const accountId = connected ? connection.account.emailAddress : undefined;
  const questionDatabase = useQuestionDatabase(
    googleDrive.bridge ?? null,
    accountId,
  );
  const { ai, aiQuestions, aiQuestionsPackages, aiGeneration } =
    useAiQuestionTools(
      googleDrive.bridge ?? null,
      connection,
      locale,
      questionDatabase,
    );
  const preloading =
    connected &&
    (questionDatabase.loading ||
      aiQuestions.loading ||
      aiQuestions.globalLoading ||
      aiQuestionsPackages.loading);
  const loginState = googleDrive.statusReady ? connection.state : 'connecting';
  const [unlocked, setUnlocked] = useState(connected);
  useEffect(() => setUnlocked((current) => current || connected), [connected]);

  useEffect(() => {
    saveShellLocale(locale);
    document.documentElement.lang = locale;
    const sectionTitle =
      view === 'home'
        ? ''
        : view === 'options'
          ? copy.shell.settingsLabel
          : view === 'visualEditor'
            ? copy.shell.visualEditor.label
            : copy.shell[view].label;
    document.title = sectionTitle
      ? `${sectionTitle} — ${copy.meta.title}`
      : copy.meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', copy.meta.description);
  }, [copy, locale, view]);

  useEffect(() => {
    saveShellTheme(theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useLayoutEffect(() => {
    saveUiAnimations(uiAnimations);
    document.documentElement.dataset.uiAnimations = String(uiAnimations);
  }, [uiAnimations]);

  useEffect(() => {
    saveEditorTextOptions(localStorage, editorOptions);
  }, [editorOptions]);

  useEffect(() => {
    setGameOptionsError(
      saveGameOptions(localStorage, gameOptions)
        ? ''
        : copy.allWeb.saveVisualsFailed,
    );
  }, [copy, gameOptions]);

  async function importVisualEditorTemplate(file: File) {
    try {
      const imported = await parseVisualEditorTemplateFile(file, gameOptions);
      if (imported) {
        googleDrive.setGameOptions(imported);
        return;
      }
    } catch {
      // Report file read failures with the same actionable import error.
    }
    setGameOptionsError(copy.allWeb.importVisualsFailed);
  }

  function exportVisualEditorTemplate() {
    try {
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(serializeVisualEditorTemplate(gameOptions))], {
          type: 'application/zip',
        }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'schdk-visual-template.schdk-template';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setGameOptionsError(copy.allWeb.exportVisualsFailed);
    }
  }

  return (
    <LocaleProvider locale={locale} onLocaleChange={setLocale}>
      {(!unlocked || !connected) && (
        <GoogleLoginView
          state={loginState}
          onConnect={() => void googleDrive.connect()}
        />
      )}
      {unlocked && (
        <div hidden={!connected}>
          <ShellView
            editorApp={
              <Suspense key={googleDrive.accountId} fallback={null}>
                <EditorApp
                  aiGeneration={aiGeneration}
                  drive={googleDrive.bridge ?? undefined}
                  driveActive={connected}
                  manageDocumentTitle={false}
                  onDriveFailure={googleDrive.reportFailure}
                  questionDatabaseRows={questionDatabase.entries}
                  sessionScope={`${window.location.pathname}:${googleDrive.accountId}`}
                  textOptions={editorOptions}
                />
              </Suspense>
            }
            hostApp={
              <Suspense key={googleDrive.accountId} fallback={null}>
                <HostApp
                  autoFullscreen={gameOptions.autoFullscreen}
                  backgroundImage={gameOptions.backgroundImage}
                  backgroundOpacity={gameOptions.backgroundOpacity}
                  customElements={gameOptions.customElements}
                  drive={googleDrive.bridge ?? undefined}
                  driveActive={connected}
                  layout={gameOptions.layout}
                  onDriveFailure={googleDrive.reportFailure}
                  sessionScope={`${window.location.pathname}:${googleDrive.accountId}`}
                  soundVolume={gameOptions.soundVolume}
                  musicVolume={gameOptions.musicVolume}
                />
              </Suspense>
            }
            loadedViews={navigation.loadedViews}
            preloading={preloading}
            questionDatabase={{
              failed: questionDatabase.failed,
              loading: questionDatabase.loading,
              progress: questionDatabase.progress,
              rows: questionDatabase.entries,
            }}
            aiOptions={ai.options}
            aiQuestions={aiQuestions}
            aiQuestionsPackages={aiQuestionsPackages}
            editTarget={navigation.editTarget}
            editorOptions={editorOptions}
            gameOptions={gameOptions}
            gameOptionsError={gameOptionsError}
            googleDriveAccount={
              'account' in connection ? connection.account : undefined
            }
            googleDriveState={connection.state}
            settingsGroup={settings.group}
            theme={theme}
            uiAnimations={uiAnimations}
            view={view}
            onEditorOptionsChange={googleDrive.setEditorTextOptions}
            onAiApiKeySave={ai.saveApiKey}
            onAiModelChange={ai.setModel}
            onAiProviderChange={ai.setProvider}
            onGameOptionsChange={googleDrive.setGameOptions}
            onGoogleDriveConnect={() => void googleDrive.connect()}
            onGoogleDriveDisconnect={() => void googleDrive.disconnect()}
            onImportVisualEditorTemplate={importVisualEditorTemplate}
            onExportVisualEditorTemplate={exportVisualEditorTemplate}
            onCloseEditor={navigation.closeEditor}
            onShowEditor={navigation.showEditor}
            onShowView={navigation.showView}
            onSettingsGroupChange={settings.showGroup}
            onThemeChange={setTheme}
            onUiAnimationsChange={setUiAnimations}
          />
        </div>
      )}
      <AppUpdateButton />
    </LocaleProvider>
  );
}

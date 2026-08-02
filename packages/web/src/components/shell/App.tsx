import type { GameOptions } from '@schdk/common';
import type { EditorTextOptions } from '@schdk/ui/options';
import { LOCALIZATION_COPY, LocaleProvider } from '@schdk/ui/localization';
import { AsyncBoundary, AsyncLoading, GoogleLoginView } from '@schdk/ui/shell';
import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { loadEditorTextOptions } from '../../storage/editor/editor-options-storage';
import { loadGameOptions } from '../../storage/options/load-game-options';
import {
  loadShellLocale,
  loadShellTheme,
  loadUiAnimations,
  loadAppFont,
  saveShellLocale,
  saveShellTheme,
  saveUiAnimations,
  saveAppFont,
} from '../../types/shell/shell-preferences';
import { useAiQuestionTools } from '../../hooks/ai-questions/use-ai-question-tools';
import { AppUpdateButton } from '../desktop/AppUpdateButton';
import { useGoogleDriveSettings } from '../../hooks/google-drive/use-google-drive-settings';
import { useShellNavigation } from '../../hooks/shell/use-shell-navigation';
import { useSettingsDeepLink } from '../../hooks/settings/use-settings-deep-link';
import { useQuestionDatabase } from '../../hooks/question-database/use-question-database';
import { ShellWorkspace } from './ShellWorkspace';
import { useVisualEditorActions } from '../../hooks/shell/use-visual-editor-actions';

const HostApp = lazy(() =>
  import('../../host/App').then(({ App }) => ({ default: App })),
);
const EditorApp = lazy(() =>
  import('../../editor/App').then(({ App }) => ({ default: App })),
);

export function App() {
  const sessionScope = window.location.pathname;
  const [locale, setLocale] = useState(loadShellLocale);
  const [theme, setTheme] = useState(loadShellTheme);
  const [font, setFont] = useState(loadAppFont);
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
  const googleDrive = useGoogleDriveSettings({
    editorTextOptions: editorOptions,
    gameOptions,
    setEditorTextOptions: setEditorOptionsState,
    setGameOptions: setGameOptionsState,
  });
  const { connection } = googleDrive;
  const connected = connection.state === 'connected';
  const accountId = connected ? connection.account.emailAddress : undefined;
  const editorDataEnabled = Boolean(navigation.loadedViews.editor);
  const questionDatabase = useQuestionDatabase(
    googleDrive.bridge ?? null,
    accountId,
    Boolean(navigation.loadedViews.questionDatabase) || editorDataEnabled,
  );
  const { ai, aiQuestions, aiQuestionsPackages, aiGeneration, dictionaries } =
    useAiQuestionTools(googleDrive.bridge ?? null, connection, locale, {
      questions:
        Boolean(navigation.loadedViews.artificialIntelligence) ||
        Boolean(navigation.loadedViews.packageRules) ||
        editorDataEnabled,
      packages:
        Boolean(navigation.loadedViews.packageRules) || editorDataEnabled,
      dictionaries:
        Boolean(navigation.loadedViews.dictionaries) || editorDataEnabled,
    });
  const preloading =
    connected &&
    (questionDatabase.loading ||
      aiQuestions.loading ||
      aiQuestions.globalLoading ||
      aiQuestionsPackages.loading ||
      dictionaries.loading);
  const loginState = googleDrive.statusReady ? connection.state : 'connecting';
  const visualEditor = useVisualEditorActions(
    gameOptions,
    googleDrive.setGameOptions,
    googleDrive.gameOptionsStorageFailed,
    googleDrive.accountId,
    {
      importFailed: copy.allWeb.importVisualsFailed,
      exportFailed: copy.allWeb.exportVisualsFailed,
      saveFailed: copy.allWeb.saveVisualsFailed,
    },
  );
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
    saveAppFont(font);
    document.documentElement.dataset.font = font;
  }, [font]);

  useLayoutEffect(() => {
    saveUiAnimations(uiAnimations);
    document.documentElement.dataset.uiAnimations = String(uiAnimations);
  }, [uiAnimations]);

  return (
    <LocaleProvider locale={locale} onLocaleChange={setLocale}>
      {(!unlocked || !connected) && (
        <GoogleLoginView
          privacyHref={window.desktop ? undefined : 'privacy.html'}
          state={loginState}
          onConnect={() => void googleDrive.connect()}
        />
      )}
      {unlocked && (
        <div hidden={!connected}>
          <ShellWorkspace
            apps={{
              editor: (
                <AsyncBoundary onRetry={() => window.location.reload()}>
                  <Suspense
                    key={googleDrive.accountId}
                    fallback={<AsyncLoading />}
                  >
                    <EditorApp
                      aiGeneration={aiGeneration}
                      drive={googleDrive.bridge ?? undefined}
                      driveActive={connected}
                      manageDocumentTitle={false}
                      onDriveFailure={googleDrive.reportFailure}
                      onExit={() => navigation.showView('home')}
                      questionDatabaseRows={questionDatabase.entries}
                      sessionScope={`${window.location.pathname}:${googleDrive.accountId}`}
                      textOptions={editorOptions}
                    />
                  </Suspense>
                </AsyncBoundary>
              ),
              host: (
                <AsyncBoundary onRetry={() => window.location.reload()}>
                  <Suspense
                    key={googleDrive.accountId}
                    fallback={<AsyncLoading />}
                  >
                    <HostApp
                      autoFullscreen={gameOptions.autoFullscreen}
                      backgroundImage={gameOptions.backgroundImage}
                      backgroundOpacity={gameOptions.backgroundOpacity}
                      backgroundGradientFrom={
                        gameOptions.backgroundGradientFrom
                      }
                      backgroundGradientTo={gameOptions.backgroundGradientTo}
                      backgroundGradientDirection={
                        gameOptions.backgroundGradientDirection
                      }
                      customElements={gameOptions.customElements}
                      drive={googleDrive.bridge ?? undefined}
                      driveActive={connected}
                      layout={gameOptions.layout}
                      onDriveFailure={googleDrive.reportFailure}
                      onExit={() => navigation.showView('home')}
                      sessionScope={`${window.location.pathname}:${googleDrive.accountId}`}
                      soundVolume={gameOptions.soundVolume}
                      musicVolume={gameOptions.musicVolume}
                    />
                  </Suspense>
                </AsyncBoundary>
              ),
            }}
            data={{
              preloading,
              questionDatabase: {
                failed: questionDatabase.failed,
                loading: questionDatabase.loading,
                progress: questionDatabase.progress,
                rows: questionDatabase.entries,
              },
              aiQuestions: {
                ...aiQuestions,
                onAdd: aiQuestions.addQuestion,
                onAddGlobal: aiQuestions.addGlobalQuestion,
                onRemove: aiQuestions.removeQuestion,
                onRemoveGlobal: aiQuestions.removeGlobalQuestion,
                onUpdate: aiQuestions.updateQuestion,
                onUpdateGlobal: aiQuestions.updateGlobalQuestion,
              },
              aiQuestionPackages: {
                ...aiQuestionsPackages,
                questionRules: [
                  ...aiQuestions.questions,
                  ...aiQuestions.globalQuestions,
                ].filter(
                  (question) => question.enabled && !question.generalRule,
                ),
                onAdd: aiQuestionsPackages.addPackage,
                onRemove: aiQuestionsPackages.removePackage,
                onUpdate: aiQuestionsPackages.updatePackage,
              },
              dictionaries: {
                ...dictionaries,
                onUpdate: dictionaries.updateDictionary,
              },
            }}
            navigation={navigation}
            settings={{
              theme,
              options: {
                ai: ai.options,
                editor: editorOptions,
                game: gameOptions,
                googleDriveAccount:
                  connection.state === 'connected'
                    ? connection.account.emailAddress
                    : undefined,
                googleDriveState: connection.state,
                settingsGroup: settings.group,
                font,
                theme,
                uiAnimations,
                onAiApiKeySave: ai.saveApiKey,
                onAiModelChange: ai.setModel,
                onAiProviderChange: ai.setProvider,
                onEditorChange: googleDrive.setEditorTextOptions,
                onGameChange: visualEditor.change,
                onGoogleDriveConnect: () => void googleDrive.connect(),
                onGoogleDriveDisconnect: () => void googleDrive.disconnect(),
                onSettingsGroupChange: settings.showGroup,
                onFontChange: setFont,
                onThemeChange: setTheme,
                onUiAnimationsChange: setUiAnimations,
              },
              visualEditor: {
                canRedo: visualEditor.canRedo,
                canUndo: visualEditor.canUndo,
                game: gameOptions,
                message: visualEditor.error,
                onChange: visualEditor.change,
                onImportTemplate: visualEditor.importTemplate,
                onExportTemplate: visualEditor.exportTemplate,
                onRedo: visualEditor.redo,
                onUndo: visualEditor.undo,
              },
            }}
          />
        </div>
      )}
      <AppUpdateButton />
    </LocaleProvider>
  );
}

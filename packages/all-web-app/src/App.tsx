import { getDeepLinkedPackageName } from '@schdk/editor-web-app/deep-link';
import type { EditorTextOptions, GameOptions } from '@schdk/ui/options';
import { LOCALIZATION_COPY, LocaleProvider } from '@schdk/ui/localization';
import {
  GoogleLoginView,
  ShellView,
  type ShellViewName,
} from '@schdk/ui/shell';
import { lazy, Suspense, useEffect, useState } from 'react';
import {
  getDeepLinkedShellView,
  getShellDeepLink,
  loadDesktopShellView,
  saveDesktopShellView,
} from './desktop-session';
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
  saveShellLocale,
  saveShellTheme,
} from './shell-preferences';
import { useAiQuestionTools } from './ai-question-generation';
import { useGoogleDriveSettings } from './use-google-drive-settings';
import { useSettingsDeepLink } from './use-settings-deep-link';

const HostApp = lazy(() =>
  import('@schdk/host-web-app/app').then(({ App }) => ({ default: App })),
);
const EditorApp = lazy(() =>
  import('@schdk/editor-web-app/app').then(({ App }) => ({ default: App })),
);

function getLinkedView(): ShellViewName | null {
  const url = new URL(window.location.href);
  const linkedView =
    getDeepLinkedShellView(url.href) ??
    (url.searchParams.has('hostPackage') ? 'host' : null) ??
    (getDeepLinkedPackageName(url.href) ? 'editor' : null);
  return linkedView;
}

export function App() {
  const sessionScope = window.location.pathname;
  const [locale, setLocale] = useState(loadShellLocale);
  const [theme, setTheme] = useState(loadShellTheme);
  const copy = LOCALIZATION_COPY[locale];
  const [view, setView] = useState<ShellViewName>(() => {
    return (
      getLinkedView() ??
      loadDesktopShellView(localStorage, sessionScope) ??
      'home'
    );
  });
  const settings = useSettingsDeepLink(view);
  const [loadedApps, setLoadedApps] = useState({
    host: view === 'host',
    editor: view === 'editor',
  });
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
  const { ai, aiQuestions, aiGeneration } = useAiQuestionTools(
    googleDrive.bridge ?? null,
    connection,
    locale,
  );
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

  useEffect(() => {
    saveDesktopShellView(localStorage, sessionScope, view);
    const deepLink = getShellDeepLink(window.location.href, view);
    if (deepLink !== window.location.href) {
      window.history.replaceState(window.history.state, '', deepLink);
    }
  }, [sessionScope, view]);

  useEffect(() => {
    function restoreDeepLinkedView() {
      showView(getLinkedView() ?? 'home', false);
    }
    window.addEventListener('popstate', restoreDeepLinkedView);
    return () => window.removeEventListener('popstate', restoreDeepLinkedView);
  }, []);

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

  function showView(nextView: ShellViewName, pushHistory = true) {
    if (nextView === 'host' || nextView === 'editor') {
      setLoadedApps((current) => ({ ...current, [nextView]: true }));
    }
    if (pushHistory) {
      const deepLink = getShellDeepLink(window.location.href, nextView);
      window.history.pushState(window.history.state, '', deepLink);
    }
    setView(nextView);
  }

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
                  onDriveFailure={() => void googleDrive.reportFailure()}
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
                  onDriveFailure={() => void googleDrive.reportFailure()}
                  sessionScope={`${window.location.pathname}:${googleDrive.accountId}`}
                  soundVolume={gameOptions.soundVolume}
                  musicVolume={gameOptions.musicVolume}
                />
              </Suspense>
            }
            loadedApps={loadedApps}
            aiOptions={ai.options}
            aiQuestions={aiQuestions}
            editorOptions={editorOptions}
            gameOptions={gameOptions}
            gameOptionsError={gameOptionsError}
            googleDriveAccount={
              'account' in connection ? connection.account : undefined
            }
            googleDriveState={connection.state}
            settingsGroup={settings.group}
            theme={theme}
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
            onShowView={(nextView) => showView(nextView)}
            onSettingsGroupChange={settings.showGroup}
            onThemeChange={setTheme}
          />
        </div>
      )}
    </LocaleProvider>
  );
}

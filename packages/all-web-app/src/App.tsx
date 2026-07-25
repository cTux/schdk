import { getDeepLinkedPackageName } from '@schdk/editor-web-app/deep-link';
import type {
  AppTheme,
  EditorTextOptions,
  GameOptions,
} from '@schdk/ui/options';
import {
  LOCALIZATION_COPY,
  LocaleProvider,
  type AppLocale,
} from '@schdk/ui/localization';
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
  parseVisualEditorTemplate,
  saveEditorTextOptions,
  saveGameOptions,
  serializeVisualEditorTemplate,
} from './options-storage';
import { useGoogleDriveSettings } from './use-google-drive-settings';

const SHELL_LOCALE_STORAGE_KEY = 'schdk.shell.locale';
const SHELL_THEME_STORAGE_KEY = 'schdk.shell.theme';
function getInitialLocale(): AppLocale {
  const stored = localStorage.getItem(SHELL_LOCALE_STORAGE_KEY);
  if (stored === 'uk' || stored === 'en') return stored;
  return 'uk';
}

function getInitialTheme(): AppTheme {
  const stored = localStorage.getItem(SHELL_THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'system';
}

const HostApp = lazy(() =>
  import('@schdk/host-web-app/app').then(({ App }) => ({ default: App })),
);
const EditorApp = lazy(() =>
  import('@schdk/editor-web-app/app').then(({ App }) => ({ default: App })),
);

function getLinkedView(): ShellViewName | null {
  const url = new URL(window.location.href);
  return (
    getDeepLinkedShellView(url.href) ??
    (url.searchParams.has('hostPackage') ? 'host' : null) ??
    (getDeepLinkedPackageName(url.href) ? 'editor' : null)
  );
}

export function App() {
  const sessionScope = window.location.pathname;
  const [locale, setLocale] = useState(getInitialLocale);
  const [theme, setTheme] = useState(getInitialTheme);
  const copy = LOCALIZATION_COPY[locale];
  const [view, setView] = useState<ShellViewName>(() => {
    return (
      getLinkedView() ??
      loadDesktopShellView(localStorage, sessionScope) ??
      'home'
    );
  });
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
  const loginState = googleDrive.statusReady ? connection.state : 'connecting';
  const [unlocked, setUnlocked] = useState(connected);

  useEffect(() => setUnlocked((current) => current || connected), [connected]);

  useEffect(() => {
    localStorage.setItem(SHELL_LOCALE_STORAGE_KEY, locale);
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
    localStorage.setItem(SHELL_THEME_STORAGE_KEY, theme);
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
      const imported = parseVisualEditorTemplate(
        new Uint8Array(await file.arrayBuffer()),
        gameOptions,
      );
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
              <Suspense fallback={null}>
                <EditorApp
                  drive={googleDrive.bridge ?? undefined}
                  driveActive={connected}
                  manageDocumentTitle={false}
                  onDriveFailure={() => void googleDrive.reportFailure()}
                  textOptions={editorOptions}
                />
              </Suspense>
            }
            hostApp={
              <Suspense fallback={null}>
                <HostApp
                  autoFullscreen={gameOptions.autoFullscreen}
                  backgroundImage={gameOptions.backgroundImage}
                  backgroundOpacity={gameOptions.backgroundOpacity}
                  customElements={gameOptions.customElements}
                  drive={googleDrive.bridge ?? undefined}
                  driveActive={connected}
                  layout={gameOptions.layout}
                  onDriveFailure={() => void googleDrive.reportFailure()}
                  soundVolume={gameOptions.soundVolume}
                />
              </Suspense>
            }
            loadedApps={loadedApps}
            editorOptions={editorOptions}
            gameOptions={gameOptions}
            gameOptionsError={gameOptionsError}
            googleDriveAccount={
              'account' in connection ? connection.account : undefined
            }
            googleDriveState={connection.state}
            theme={theme}
            view={view}
            onEditorOptionsChange={googleDrive.setEditorTextOptions}
            onGameOptionsChange={googleDrive.setGameOptions}
            onGoogleDriveConnect={() => void googleDrive.connect()}
            onGoogleDriveDisconnect={() => void googleDrive.disconnect()}
            onImportVisualEditorTemplate={importVisualEditorTemplate}
            onExportVisualEditorTemplate={exportVisualEditorTemplate}
            onShowView={(nextView) => showView(nextView)}
            onThemeChange={setTheme}
          />
        </div>
      )}
    </LocaleProvider>
  );
}

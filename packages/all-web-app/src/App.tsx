import { getDeepLinkedPackageName } from '@schdk/editor-web-app/deep-link';
import type { EditorTextOptions, GameOptions } from '@schdk/ui/options';
import { ShellView, type ShellViewName } from '@schdk/ui/shell';
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
  saveEditorTextOptions,
  saveGameOptions,
} from './options-storage';

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
  const [editorOptions, setEditorOptions] = useState<EditorTextOptions>(() =>
    loadEditorTextOptions(localStorage),
  );
  const [gameOptions, setGameOptions] = useState<GameOptions>(() =>
    loadGameOptions(localStorage),
  );
  const [gameOptionsError, setGameOptionsError] = useState('');

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
        : 'Не вдалося зберегти оформлення. Видаліть зайві зображення та спробуйте ще раз.',
    );
  }, [gameOptions]);

  function showView(nextView: ShellViewName, pushHistory = true) {
    if (nextView === 'host' || nextView === 'editor') {
      setLoadedApps((current) => ({ ...current, [nextView]: true }));
    }
    if (pushHistory) {
      window.history.pushState(
        window.history.state,
        '',
        getShellDeepLink(window.location.href, nextView),
      );
    }
    setView(nextView);
  }

  return (
    <ShellView
      editorApp={
        <Suspense fallback={null}>
          <EditorApp textOptions={editorOptions} />
        </Suspense>
      }
      hostApp={
        <Suspense fallback={null}>
          <HostApp
            backgroundImage={gameOptions.backgroundImage}
            backgroundOpacity={gameOptions.backgroundOpacity}
            customElements={gameOptions.customElements}
            layout={gameOptions.layout}
            soundVolume={gameOptions.soundVolume}
          />
        </Suspense>
      }
      loadedApps={loadedApps}
      editorOptions={editorOptions}
      gameOptions={gameOptions}
      gameOptionsError={gameOptionsError}
      view={view}
      onEditorOptionsChange={setEditorOptions}
      onGameOptionsChange={setGameOptions}
      onShowView={(nextView) => showView(nextView)}
    />
  );
}

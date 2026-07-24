import { getDeepLinkedPackageName } from '@schdk/editor-web-app/deep-link';
import type { EditorTextOptions, GameOptions } from '@schdk/ui/options';
import { ShellView, type ShellViewName } from '@schdk/ui/shell';
import { lazy, Suspense, useEffect, useState } from 'react';
import { loadDesktopShellView, saveDesktopShellView } from './desktop-session';
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

export function App() {
  const isDesktop = Boolean(window.desktop);
  const sessionScope = window.location.pathname;
  const [view, setView] = useState<ShellViewName>(() => {
    if (isDesktop) {
      return loadDesktopShellView(localStorage, sessionScope) ?? 'home';
    }
    return getDeepLinkedPackageName(window.location.href) ? 'editor' : 'home';
  });
  const [loadedApps, setLoadedApps] = useState({
    host: false,
    editor: view === 'editor',
  });
  const [editorOptions, setEditorOptions] = useState<EditorTextOptions>(() =>
    loadEditorTextOptions(localStorage),
  );
  const [gameOptions, setGameOptions] = useState<GameOptions>(() =>
    loadGameOptions(localStorage),
  );

  useEffect(() => {
    if (isDesktop) saveDesktopShellView(localStorage, sessionScope, view);
  }, [isDesktop, sessionScope, view]);

  useEffect(() => {
    saveEditorTextOptions(localStorage, editorOptions);
  }, [editorOptions]);

  useEffect(() => {
    saveGameOptions(localStorage, gameOptions);
  }, [gameOptions]);

  function showView(nextView: ShellViewName) {
    if (nextView === 'host' || nextView === 'editor') {
      setLoadedApps((current) => ({ ...current, [nextView]: true }));
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
            layout={gameOptions.layout}
            soundVolume={gameOptions.soundVolume}
          />
        </Suspense>
      }
      loadedApps={loadedApps}
      editorOptions={editorOptions}
      gameOptions={gameOptions}
      view={view}
      onEditorOptionsChange={setEditorOptions}
      onGameOptionsChange={setGameOptions}
      onShowView={showView}
    />
  );
}

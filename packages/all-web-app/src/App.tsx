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
  parseVisualEditorTemplate,
  saveEditorTextOptions,
  saveGameOptions,
  serializeVisualEditorTemplate,
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

  async function importVisualEditorTemplate(file: File) {
    try {
      const imported = parseVisualEditorTemplate(
        await file.text(),
        gameOptions.soundVolume,
      );
      if (imported) {
        setGameOptions(imported);
        return;
      }
    } catch {
      // Report file read failures with the same actionable import error.
    }
    setGameOptionsError('Не вдалося імпортувати шаблон оформлення.');
  }

  function exportVisualEditorTemplate() {
    try {
      const url = URL.createObjectURL(
        new Blob([serializeVisualEditorTemplate(gameOptions)], {
          type: 'application/json',
        }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'schdk-visual-template.schdk-template';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setGameOptionsError('Не вдалося експортувати шаблон оформлення.');
    }
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
      onImportVisualEditorTemplate={importVisualEditorTemplate}
      onExportVisualEditorTemplate={exportVisualEditorTemplate}
      onShowView={(nextView) => showView(nextView)}
    />
  );
}

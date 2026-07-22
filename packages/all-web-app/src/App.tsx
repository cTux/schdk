import { getDeepLinkedPackageName } from '@schdk/editor-web-app/deep-link';
import { ShellView, type ShellViewName } from '@schdk/ui/shell';
import { lazy, Suspense, useEffect, useState } from 'react';
import { loadDesktopShellView, saveDesktopShellView } from './desktop-session';

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

  useEffect(() => {
    if (isDesktop) saveDesktopShellView(localStorage, sessionScope, view);
  }, [isDesktop, sessionScope, view]);

  function showView(nextView: ShellViewName) {
    if (nextView !== 'home') {
      setLoadedApps((current) => ({ ...current, [nextView]: true }));
    }
    setView(nextView);
  }

  return (
    <ShellView
      editorApp={
        <Suspense fallback={null}>
          <EditorApp />
        </Suspense>
      }
      hostApp={
        <Suspense fallback={null}>
          <HostApp />
        </Suspense>
      }
      loadedApps={loadedApps}
      view={view}
      onShowView={showView}
    />
  );
}

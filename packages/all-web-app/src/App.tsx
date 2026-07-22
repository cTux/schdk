import { getDeepLinkedPackageName } from '@schdk/editor-web-app/deep-link';
import { ShellView, type ShellViewName } from '@schdk/ui/shell';
import { lazy, Suspense, useState } from 'react';

const HostApp = lazy(() =>
  import('@schdk/host-web-app/app').then(({ App }) => ({ default: App })),
);
const EditorApp = lazy(() =>
  import('@schdk/editor-web-app/app').then(({ App }) => ({ default: App })),
);

export function App() {
  const [view, setView] = useState<ShellViewName>(() =>
    getDeepLinkedPackageName(window.location.href) ? 'editor' : 'home',
  );
  const [loadedApps, setLoadedApps] = useState({
    host: false,
    editor: view === 'editor',
  });

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

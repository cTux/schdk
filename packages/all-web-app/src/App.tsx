import { ShellView, type ShellViewName } from '@schdk/ui/shell';
import { useEffect, useState } from 'react';

const APP_URLS = import.meta.env.DEV
  ? {
      host: 'http://127.0.0.1:5174',
      editor: 'http://127.0.0.1:5175',
    }
  : { host: './apps/host/index.html', editor: './apps/editor/index.html' };

export function App() {
  const [view, setView] = useState<ShellViewName>('home');
  const [loadedApps, setLoadedApps] = useState({ host: false, editor: false });

  useEffect(() => {
    if (loadedApps.editor) return;
    return window.desktop?.onCloseRequested((attempt) => {
      window.desktop!.finishCloseAttempt(attempt, true);
    });
  }, [loadedApps.editor]);

  function showView(nextView: ShellViewName) {
    if (nextView !== 'home') {
      setLoadedApps((current) => ({ ...current, [nextView]: true }));
    }
    setView(nextView);
  }

  return (
    <ShellView
      appUrls={APP_URLS}
      loadedApps={loadedApps}
      view={view}
      onShowView={showView}
    />
  );
}

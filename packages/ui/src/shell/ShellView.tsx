import type { ReactNode } from 'react';
import '../styles/shell.scss';
import { ShellHome } from './ShellHome';
import { ShellNavigation } from './ShellNavigation';
import type { ShellViewName } from './shellItems';

export type { ShellViewName } from './shellItems';

interface ShellViewProps {
  editorApp: ReactNode;
  hostApp: ReactNode;
  loadedApps: { host: boolean; editor: boolean };
  view: ShellViewName;
  onShowView(view: ShellViewName): void;
}

export function ShellView({
  editorApp,
  hostApp,
  loadedApps,
  view,
  onShowView,
}: ShellViewProps) {
  return (
    <main className="app-shell">
      <ShellNavigation view={view} onSelect={onShowView} />
      <section className="workspace">
        <ShellHome hidden={view !== 'home'} onOpen={onShowView} />
        {loadedApps.host && (
          <div className="embedded-app" hidden={view !== 'host'}>
            {hostApp}
          </div>
        )}
        {loadedApps.editor && (
          <div className="embedded-app" hidden={view !== 'editor'}>
            {editorApp}
          </div>
        )}
      </section>
    </main>
  );
}

import type { ReactNode } from 'react';
import '../styles/shell.scss';
import { ShellHome } from './ShellHome';
import { ShellNavigation } from './ShellNavigation';
import type { ShellViewName } from './shellItems';
import { OptionsPage } from '../options/OptionsPage';
import type { EditorTextOptions, GameOptions } from '../options/types';

export type { ShellViewName } from './shellItems';

interface ShellViewProps {
  editorApp: ReactNode;
  hostApp: ReactNode;
  loadedApps: { host: boolean; editor: boolean };
  editorOptions: EditorTextOptions;
  gameOptions: GameOptions;
  view: ShellViewName;
  onEditorOptionsChange(options: EditorTextOptions): void;
  onGameOptionsChange(options: GameOptions): void;
  onShowView(view: ShellViewName): void;
}

export function ShellView({
  editorApp,
  hostApp,
  loadedApps,
  editorOptions,
  gameOptions,
  view,
  onEditorOptionsChange,
  onGameOptionsChange,
  onShowView,
}: ShellViewProps) {
  return (
    <main className="app-shell">
      <ShellNavigation view={view} onSelect={onShowView} />
      <section className="workspace">
        <ShellHome hidden={view !== 'home'} onOpen={onShowView} />
        <OptionsPage
          hidden={view !== 'options'}
          editor={editorOptions}
          game={gameOptions}
          onEditorChange={onEditorOptionsChange}
          onGameChange={onGameOptionsChange}
        />
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

import './styles.scss';

import type { ReactNode } from 'react';
import { ShellHome } from '../ShellHome';
import { ShellNavigation } from '../ShellNavigation';
import type { ShellViewName } from '../shellItems';
import { OptionsPage } from '../../options/OptionsPage';
import type { EditorTextOptions, GameOptions } from '../../options/types';
import { VisualEditor } from '../../visual-editor/VisualEditor';
import { TooltipProvider } from '../../atoms/Tooltip';

export type { ShellViewName } from '../shellItems';

export interface ShellViewProps {
  editorApp: ReactNode;
  hostApp: ReactNode;
  loadedApps: { host: boolean; editor: boolean };
  editorOptions: EditorTextOptions;
  gameOptions: GameOptions;
  gameOptionsError: string;
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
  gameOptionsError,
  view,
  onEditorOptionsChange,
  onGameOptionsChange,
  onShowView,
}: ShellViewProps) {
  return (
    <TooltipProvider>
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
          <VisualEditor
            message={gameOptionsError}
            hidden={view !== 'visualEditor'}
            game={gameOptions}
            onChange={onGameOptionsChange}
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
    </TooltipProvider>
  );
}

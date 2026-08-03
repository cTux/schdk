import type {
  GameOptions,
  GamePresentationOptions,
} from '@schdk/common/game-options';
import { useRef, useState } from 'react';
import { downloadVisualEditorTemplate } from '../../utils/visual-editor/download-visual-editor-template';
import { parseVisualEditorTemplateFile } from '../../utils/visual-editor/parse-visual-editor-template-file';
import {
  createVisualEditorHistory,
  recordVisualEditorChange,
  redoVisualEditorChange,
  undoVisualEditorChange,
} from '../../utils/visual-editor/visual-editor-history';

function getPresentation(game: GameOptions): GamePresentationOptions {
  return {
    layout: game.layout,
    customElements: game.customElements,
    backgroundImage: game.backgroundImage,
    backgroundOpacity: game.backgroundOpacity,
    backgroundGradientFrom: game.backgroundGradientFrom,
    backgroundGradientTo: game.backgroundGradientTo,
    backgroundGradientDirection: game.backgroundGradientDirection,
  };
}

export function useVisualEditorActions(
  game: GameOptions,
  onChange: (game: GameOptions) => void,
  syncFailed: boolean,
  historyKey: string | null | undefined,
  messages: { importFailed: string; exportFailed: string; saveFailed: string },
) {
  const [actionError, setActionError] = useState('');
  const currentGame = useRef(game);
  const currentPresentation = useRef(getPresentation(game));
  const history = useRef(createVisualEditorHistory());
  const currentHistoryKey = useRef(historyKey);
  currentGame.current = game;
  currentPresentation.current = getPresentation(game);
  if (currentHistoryKey.current !== historyKey) {
    currentHistoryKey.current = historyKey;
    history.current = createVisualEditorHistory();
  }

  function apply(value: GamePresentationOptions) {
    currentPresentation.current = value;
    const next = { ...currentGame.current, ...value };
    currentGame.current = next;
    onChange(next);
  }

  function change(value: GamePresentationOptions) {
    setActionError('');
    history.current = recordVisualEditorChange(
      history.current,
      currentPresentation.current,
    );
    apply(value);
  }

  function undo() {
    const previous = undoVisualEditorChange(
      history.current,
      currentPresentation.current,
    );
    if (!previous) return;
    history.current = previous.history;
    setActionError('');
    apply(previous.value);
  }

  function redo() {
    const next = redoVisualEditorChange(
      history.current,
      currentPresentation.current,
    );
    if (!next) return;
    history.current = next.history;
    setActionError('');
    apply(next.value);
  }

  async function importTemplate(file: File) {
    try {
      const imported = await parseVisualEditorTemplateFile(
        file,
        currentGame.current,
      );
      if (imported) return change(getPresentation(imported));
    } catch {
      // Use the same actionable message for file read and validation failures.
    }
    setActionError(messages.importFailed);
  }

  async function exportTemplate() {
    try {
      await downloadVisualEditorTemplate(currentPresentation.current);
      setActionError('');
    } catch {
      setActionError(messages.exportFailed);
    }
  }

  return {
    canRedo: history.current.future.length > 0,
    canUndo: history.current.past.length > 0,
    change,
    importTemplate,
    exportTemplate,
    redo,
    undo,
    error: actionError || (syncFailed ? messages.saveFailed : ''),
  };
}

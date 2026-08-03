import type {
  GameOptions,
  GamePresentationOptions,
} from '@schdk/common/game-options';
import { useEffect, useReducer, useState } from 'react';
import { downloadVisualEditorTemplate } from '../../utils/visual-editor/download-visual-editor-template';
import { parseVisualEditorTemplateFile } from '../../utils/visual-editor/parse-visual-editor-template-file';
import {
  createVisualEditorHistory,
  reduceVisualEditorHistory,
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
  const [history, dispatchHistory] = useReducer(
    reduceVisualEditorHistory,
    undefined,
    createVisualEditorHistory,
  );

  useEffect(() => dispatchHistory({ type: 'reset' }), [historyKey]);

  function apply(value: GamePresentationOptions) {
    onChange({ ...game, ...value });
  }

  function change(
    value: GamePresentationOptions,
    options: { continuous?: boolean } = {},
  ) {
    setActionError('');
    dispatchHistory({
      type: 'record',
      current: getPresentation(game),
      continuous: Boolean(options.continuous),
    });
    apply(value);
  }

  function commitChange() {
    dispatchHistory({ type: 'commit' });
  }

  function undo() {
    const previous = undoVisualEditorChange(history, getPresentation(game));
    if (!previous) return;
    dispatchHistory({ type: 'replace', history: previous.history });
    setActionError('');
    apply(previous.value);
  }

  function redo() {
    const next = redoVisualEditorChange(history, getPresentation(game));
    if (!next) return;
    dispatchHistory({ type: 'replace', history: next.history });
    setActionError('');
    apply(next.value);
  }

  async function importTemplate(file: File) {
    try {
      const imported = await parseVisualEditorTemplateFile(file, game);
      if (imported) return change(getPresentation(imported));
    } catch {
      // Use the same actionable message for file read and validation failures.
    }
    setActionError(messages.importFailed);
  }

  async function exportTemplate() {
    try {
      await downloadVisualEditorTemplate(getPresentation(game));
      setActionError('');
    } catch {
      setActionError(messages.exportFailed);
    }
  }

  return {
    canRedo: history.future.length > 0,
    canUndo: history.past.length > 0,
    change,
    commitChange,
    importTemplate,
    exportTemplate,
    redo,
    undo,
    error: actionError || (syncFailed ? messages.saveFailed : ''),
  };
}

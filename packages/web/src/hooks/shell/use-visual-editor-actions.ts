import type { GameOptions } from '@schdk/common';
import { useRef, useState } from 'react';
import {
  parseVisualEditorTemplateFile,
  serializeVisualEditorTemplate,
} from '../../storage/options/options-storage';

const MAX_HISTORY_ENTRIES = 100;

export function useVisualEditorActions(
  game: GameOptions,
  onChange: (game: GameOptions) => void,
  syncFailed: boolean,
  historyKey: string | null | undefined,
  messages: { importFailed: string; exportFailed: string; saveFailed: string },
) {
  const [actionError, setActionError] = useState('');
  const currentGame = useRef(game);
  const history = useRef<{ past: GameOptions[]; future: GameOptions[] }>({
    past: [],
    future: [],
  });
  const currentHistoryKey = useRef(historyKey);
  currentGame.current = game;
  if (currentHistoryKey.current !== historyKey) {
    currentHistoryKey.current = historyKey;
    history.current = { past: [], future: [] };
  }

  function change(value: GameOptions) {
    setActionError('');
    history.current.past.push(currentGame.current);
    if (history.current.past.length > MAX_HISTORY_ENTRIES) {
      history.current.past.shift();
    }
    history.current.future = [];
    currentGame.current = value;
    onChange(value);
  }

  function undo() {
    const previous = history.current.past.pop();
    if (!previous) return;
    history.current.future.push(currentGame.current);
    currentGame.current = previous;
    setActionError('');
    onChange(previous);
  }

  function redo() {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(currentGame.current);
    if (history.current.past.length > MAX_HISTORY_ENTRIES) {
      history.current.past.shift();
    }
    currentGame.current = next;
    setActionError('');
    onChange(next);
  }
  async function importTemplate(file: File) {
    try {
      const imported = await parseVisualEditorTemplateFile(file, game);
      if (imported) return change(imported);
    } catch {
      // Use the same actionable message for file read and validation failures.
    }
    setActionError(messages.importFailed);
  }
  function exportTemplate() {
    try {
      const content = new Uint8Array(serializeVisualEditorTemplate(game));
      const url = URL.createObjectURL(
        new Blob([content], { type: 'application/zip' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'schdk-visual-template.schdk-template';
      link.click();
      URL.revokeObjectURL(url);
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

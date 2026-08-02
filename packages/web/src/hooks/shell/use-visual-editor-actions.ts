import type { GameOptions, GamePresentationOptions } from '@schdk/common';
import { useRef, useState } from 'react';
import { serializeVisualEditorTemplate } from '@schdk/common';
import { parseVisualEditorTemplateFile } from '../../utils/visual-editor/parse-visual-editor-template-file';

const MAX_HISTORY_ENTRIES = 100;
const MAX_HISTORY_BYTES = 32 * 1024 * 1024;

interface HistoryEntry {
  bytes: number;
  value: GamePresentationOptions;
}

interface VisualEditorHistory {
  future: HistoryEntry[];
  past: HistoryEntry[];
}

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

function createHistoryEntry(value: GamePresentationOptions): HistoryEntry {
  const embeddedContentCharacters = value.customElements.reduce(
    (total, element) =>
      total +
      (element.kind === 'image'
        ? (element.image?.length ?? 0)
        : element.text.length),
    value.backgroundImage?.length ?? 0,
  );
  return {
    value,
    bytes: embeddedContentCharacters * 2 + value.customElements.length * 256,
  };
}

function trimHistory(history: VisualEditorHistory) {
  while (history.past.length + history.future.length > MAX_HISTORY_ENTRIES) {
    (history.past.length ? history.past : history.future).shift();
  }
  while (
    [...history.past, ...history.future].reduce(
      (total, entry) => total + entry.bytes,
      0,
    ) > MAX_HISTORY_BYTES
  ) {
    (history.past.length ? history.past : history.future).shift();
  }
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
  const history = useRef<VisualEditorHistory>({ past: [], future: [] });
  const currentHistoryKey = useRef(historyKey);
  currentGame.current = game;
  currentPresentation.current = getPresentation(game);
  if (currentHistoryKey.current !== historyKey) {
    currentHistoryKey.current = historyKey;
    history.current = { past: [], future: [] };
  }

  function apply(value: GamePresentationOptions) {
    currentPresentation.current = value;
    const next = { ...currentGame.current, ...value };
    currentGame.current = next;
    onChange(next);
  }

  function change(value: GamePresentationOptions) {
    setActionError('');
    history.current.past.push(createHistoryEntry(currentPresentation.current));
    history.current.future = [];
    trimHistory(history.current);
    apply(value);
  }

  function undo() {
    const previous = history.current.past.pop();
    if (!previous) return;
    history.current.future.push(
      createHistoryEntry(currentPresentation.current),
    );
    trimHistory(history.current);
    setActionError('');
    apply(previous.value);
  }

  function redo() {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(createHistoryEntry(currentPresentation.current));
    trimHistory(history.current);
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

  function exportTemplate() {
    try {
      const content = new Uint8Array(
        serializeVisualEditorTemplate(currentPresentation.current),
      );
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

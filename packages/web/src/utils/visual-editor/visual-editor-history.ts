import type { GamePresentationOptions } from '@schdk/common/game-options';

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

interface HistoryChange {
  history: VisualEditorHistory;
  value: GamePresentationOptions;
}

const createVisualEditorHistory = (): VisualEditorHistory => ({
  future: [],
  past: [],
});

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
  const trimmed = {
    future: [...history.future],
    past: [...history.past],
  };
  while (trimmed.past.length + trimmed.future.length > MAX_HISTORY_ENTRIES) {
    (trimmed.past.length ? trimmed.past : trimmed.future).shift();
  }
  while (
    [...trimmed.past, ...trimmed.future].reduce(
      (total, entry) => total + entry.bytes,
      0,
    ) > MAX_HISTORY_BYTES
  ) {
    (trimmed.past.length ? trimmed.past : trimmed.future).shift();
  }
  return trimmed;
}

function recordVisualEditorChange(
  history: VisualEditorHistory,
  current: GamePresentationOptions,
) {
  return trimHistory({
    future: [],
    past: [...history.past, createHistoryEntry(current)],
  });
}

function undoVisualEditorChange(
  history: VisualEditorHistory,
  current: GamePresentationOptions,
): HistoryChange | null {
  const value = history.past[history.past.length - 1]?.value;
  if (!value) return null;
  return {
    value,
    history: trimHistory({
      past: history.past.slice(0, -1),
      future: [...history.future, createHistoryEntry(current)],
    }),
  };
}

function redoVisualEditorChange(
  history: VisualEditorHistory,
  current: GamePresentationOptions,
): HistoryChange | null {
  const value = history.future[history.future.length - 1]?.value;
  if (!value) return null;
  return {
    value,
    history: trimHistory({
      past: [...history.past, createHistoryEntry(current)],
      future: history.future.slice(0, -1),
    }),
  };
}

export {
  createVisualEditorHistory,
  recordVisualEditorChange,
  redoVisualEditorChange,
  undoVisualEditorChange,
  type VisualEditorHistory,
};

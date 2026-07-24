import {
  DEFAULT_EDITOR_TEXT_OPTIONS,
  DEFAULT_GAME_OPTIONS,
  GAME_LAYOUT_ELEMENT_IDS,
  type EditorTextOptions,
  type GameLayout,
  type GameOptions,
} from '@schdk/ui/options';

const OPTIONS_KEY = 'schdk:editor-text-options';
const GAME_OPTIONS_KEY = 'schdk:game-options';

type OptionsStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function loadEditorTextOptions(
  storage: OptionsStorage,
): EditorTextOptions {
  try {
    const value = JSON.parse(
      storage.getItem(OPTIONS_KEY) ?? 'null',
    ) as Partial<EditorTextOptions> | null;
    if (!value) return DEFAULT_EDITOR_TEXT_OPTIONS;
    return {
      correctQuestionText: value.correctQuestionText === true,
      correctAnswers: value.correctAnswers === true,
      correctAnswerComment: value.correctAnswerComment === true,
    };
  } catch {
    return DEFAULT_EDITOR_TEXT_OPTIONS;
  }
}

export function saveEditorTextOptions(
  storage: OptionsStorage,
  options: EditorTextOptions,
) {
  try {
    storage.setItem(OPTIONS_KEY, JSON.stringify(options));
  } catch {
    // Preferences are optional and must not prevent the shell from loading.
  }
}

export function loadGameOptions(storage: OptionsStorage): GameOptions {
  try {
    const value = JSON.parse(
      storage.getItem(GAME_OPTIONS_KEY) ?? 'null',
    ) as Partial<GameOptions> | null;
    if (
      typeof value?.soundVolume !== 'number' ||
      value.soundVolume < 0 ||
      value.soundVolume > 1
    ) {
      return DEFAULT_GAME_OPTIONS;
    }
    if (
      value.layout !== undefined &&
      value.layout !== null &&
      !isGameLayout(value.layout)
    ) {
      return DEFAULT_GAME_OPTIONS;
    }
    return {
      soundVolume: value.soundVolume,
      layout: value.layout ?? null,
    };
  } catch {
    return DEFAULT_GAME_OPTIONS;
  }
}

function isGameLayout(value: unknown): value is GameLayout {
  if (!value || typeof value !== 'object') return false;
  const positions = value as Record<string, unknown>;
  return GAME_LAYOUT_ELEMENT_IDS.every((id) => {
    const position = positions[id];
    if (!position || typeof position !== 'object') return false;
    const { x, y } = position as Record<string, unknown>;
    return (
      typeof x === 'number' &&
      Number.isFinite(x) &&
      x >= 0 &&
      x <= 100 &&
      typeof y === 'number' &&
      Number.isFinite(y) &&
      y >= 0 &&
      y <= 100
    );
  });
}

export function saveGameOptions(storage: OptionsStorage, options: GameOptions) {
  try {
    storage.setItem(GAME_OPTIONS_KEY, JSON.stringify(options));
  } catch {
    // Preferences are optional and must not prevent the shell from loading.
  }
}

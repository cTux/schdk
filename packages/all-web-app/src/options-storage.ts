import {
  DEFAULT_EDITOR_TEXT_OPTIONS,
  DEFAULT_GAME_OPTIONS,
  type EditorTextOptions,
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
    return { soundVolume: value.soundVolume };
  } catch {
    return DEFAULT_GAME_OPTIONS;
  }
}

export function saveGameOptions(storage: OptionsStorage, options: GameOptions) {
  try {
    storage.setItem(GAME_OPTIONS_KEY, JSON.stringify(options));
  } catch {
    // Preferences are optional and must not prevent the shell from loading.
  }
}

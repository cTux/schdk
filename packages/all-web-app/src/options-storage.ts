import {
  DEFAULT_EDITOR_TEXT_OPTIONS,
  DEFAULT_GAME_LAYOUT,
  DEFAULT_GAME_OPTIONS,
  GAME_IMAGE_POSITIONS,
  GAME_LAYOUT_ELEMENT_IDS,
  type EditorTextOptions,
  type GameLayout,
  type GameLayoutPosition,
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
    const layout = normalizeGameLayout(value.layout);
    if (value.layout !== undefined && value.layout !== null && !layout) {
      return DEFAULT_GAME_OPTIONS;
    }
    const backgroundImage = value.backgroundImage ?? null;
    const backgroundOpacity = value.backgroundOpacity ?? 1;
    if (!isBackgroundImage(backgroundImage) || !isOpacity(backgroundOpacity)) {
      return DEFAULT_GAME_OPTIONS;
    }
    return {
      soundVolume: value.soundVolume,
      layout,
      backgroundImage,
      backgroundOpacity,
    };
  } catch {
    return DEFAULT_GAME_OPTIONS;
  }
}

function normalizeGameLayout(value: unknown): GameLayout | null {
  if (value === undefined || value === null) return null;
  if (!value || typeof value !== 'object') return null;
  const positions = { ...(value as Record<string, unknown>) };
  if (positions.logo === undefined) {
    positions.logo = DEFAULT_GAME_LAYOUT.logo;
  }
  if (
    positions['alternative-answer'] === undefined &&
    isGameLayoutPosition(positions.answer)
  ) {
    positions['alternative-answer'] = {
      ...DEFAULT_GAME_LAYOUT['alternative-answer'],
      x: positions.answer.x,
      y: Math.max(0, positions.answer.y - 18),
    };
  }
  const normalized = {} as GameLayout;
  for (const id of GAME_LAYOUT_ELEMENT_IDS) {
    const position = positions[id];
    if (!isGameLayoutPosition(position)) return null;
    const defaults = DEFAULT_GAME_LAYOUT[id];
    const candidate = {
      ...defaults,
      ...(position as Partial<(typeof DEFAULT_GAME_LAYOUT)[typeof id]>),
    };
    delete (candidate as Record<string, unknown>).backgroundImage;
    delete (candidate as Record<string, unknown>).backgroundOpacity;
    if (!isGameLayoutElement(candidate)) return null;
    normalized[id] = candidate;
  }
  return normalized;
}

function isGameLayoutPosition(
  value: unknown,
): value is { x: number; y: number } {
  if (!value || typeof value !== 'object') return false;
  const { x, y } = value as Record<string, unknown>;
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
}

function isGameLayoutElement(value: unknown): value is GameLayoutPosition {
  if (!isGameLayoutPosition(value)) return false;
  const position = value as Record<string, unknown>;
  return (
    isPercentage(position.width) &&
    isPercentage(position.height) &&
    typeof position.fontScale === 'number' &&
    Number.isFinite(position.fontScale) &&
    position.fontScale >= 0.5 &&
    position.fontScale <= 2 &&
    typeof position.fitTextToHeight === 'boolean' &&
    typeof position.textColor === 'string' &&
    /^#[\da-f]{6}$/i.test(position.textColor) &&
    (position.textGrowDirection === 'up' ||
      position.textGrowDirection === 'down') &&
    typeof position.imagePosition === 'string' &&
    GAME_IMAGE_POSITIONS.includes(
      position.imagePosition as (typeof GAME_IMAGE_POSITIONS)[number],
    )
  );
}

function isBackgroundImage(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === 'string' && value.startsWith('data:image/'))
  );
}

function isOpacity(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

function isPercentage(value: unknown) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 2 &&
    value <= 100
  );
}

export function saveGameOptions(storage: OptionsStorage, options: GameOptions) {
  try {
    storage.setItem(GAME_OPTIONS_KEY, JSON.stringify(options));
  } catch {
    // Preferences are optional and must not prevent the shell from loading.
  }
}

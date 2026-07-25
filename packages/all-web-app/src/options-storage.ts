import {
  DEFAULT_EDITOR_TEXT_OPTIONS,
  DEFAULT_GAME_LAYOUT,
  DEFAULT_GAME_OPTIONS,
  GAME_IMAGE_POSITIONS,
  GAME_LAYOUT_ELEMENT_IDS,
  MAX_CUSTOM_GAME_ELEMENTS,
  MAX_CUSTOM_IMAGE_DATA_LENGTH,
  type CustomGameElement,
  type EditorTextOptions,
  type GameLayout,
  type GameLayoutPosition,
  type GameOptions,
} from '@schdk/ui/options';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

const OPTIONS_KEY = 'schdk:editor-text-options';
const GAME_OPTIONS_KEY = 'schdk:game-options';
const VISUAL_TEMPLATE_ENTRY = 'template.json';

type OptionsStorage = Pick<Storage, 'getItem' | 'setItem'>;
type VisualEditorTemplate = Omit<GameOptions, 'soundVolume'>;

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
    return (
      normalizeGameOptions(
        JSON.parse(storage.getItem(GAME_OPTIONS_KEY) ?? 'null'),
      ) ?? DEFAULT_GAME_OPTIONS
    );
  } catch {
    return DEFAULT_GAME_OPTIONS;
  }
}

function normalizeGameOptions(value: unknown): GameOptions | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<GameOptions>;
  if (
    typeof candidate.soundVolume !== 'number' ||
    candidate.soundVolume < 0 ||
    candidate.soundVolume > 1
  ) {
    return null;
  }
  const layout = normalizeGameLayout(candidate.layout);
  if (candidate.layout !== undefined && candidate.layout !== null && !layout) {
    return null;
  }
  const backgroundImage = candidate.backgroundImage ?? null;
  const backgroundOpacity = candidate.backgroundOpacity ?? 1;
  const customElements = normalizeCustomElements(candidate.customElements);
  if (
    !customElements ||
    !isBackgroundImage(backgroundImage) ||
    !isOpacity(backgroundOpacity)
  ) {
    return null;
  }
  return {
    soundVolume: candidate.soundVolume,
    layout,
    customElements,
    backgroundImage,
    backgroundOpacity,
  };
}

export function parseVisualEditorTemplate(
  content: string | Uint8Array,
  soundVolume: number,
): GameOptions | null {
  try {
    const templateJson =
      typeof content === 'string'
        ? content
        : content[0] === 0x50 && content[1] === 0x4b
          ? strFromU8(unzipSync(content)[VISUAL_TEMPLATE_ENTRY])
          : strFromU8(content);
    const value = JSON.parse(templateJson) as Record<string, unknown> | null;
    if (!value || value.version !== 1) return null;
    return normalizeGameOptions({ ...value, soundVolume });
  } catch {
    return null;
  }
}

export function serializeVisualEditorTemplate(
  options: GameOptions,
): Uint8Array {
  const template: VisualEditorTemplate & { version: 1 } = {
    version: 1,
    layout: options.layout,
    customElements: options.customElements,
    backgroundImage: options.backgroundImage,
    backgroundOpacity: options.backgroundOpacity,
  };
  return zipSync(
    {
      [VISUAL_TEMPLATE_ENTRY]: strToU8(JSON.stringify(template, null, 2)),
    },
    { level: 9 },
  );
}

function normalizeCustomElements(value: unknown): CustomGameElement[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_CUSTOM_GAME_ELEMENTS) {
    return null;
  }
  const ids = new Set<string>();
  let imageDataLength = 0;
  const normalized: CustomGameElement[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') return null;
    const candidate = entry as Record<string, unknown>;
    const { id, kind, position } = candidate;
    if (
      typeof id !== 'string' ||
      id.length === 0 ||
      ids.has(id) ||
      !isGameLayoutPosition(position)
    ) {
      return null;
    }
    const rawPosition = position as Record<string, unknown>;
    const normalizedPosition = {
      ...rawPosition,
      hidden: rawPosition.hidden ?? false,
    };
    if (!isGameLayoutElement(normalizedPosition)) return null;
    ids.add(id);
    if (
      kind === 'text' &&
      typeof candidate.text === 'string' &&
      candidate.text.length >= 1 &&
      candidate.text.length <= 500
    ) {
      normalized.push({
        id,
        kind,
        text: candidate.text,
        position: normalizedPosition,
      });
      continue;
    }
    if (kind === 'image' && isBackgroundImage(candidate.image ?? null)) {
      const image = (candidate.image ?? null) as string | null;
      imageDataLength += image?.length ?? 0;
      if (imageDataLength > MAX_CUSTOM_IMAGE_DATA_LENGTH) return null;
      normalized.push({ id, kind, image, position: normalizedPosition });
      continue;
    }
    return null;
  }
  return normalized;
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
    typeof position.hidden === 'boolean' &&
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

export function saveGameOptions(
  storage: OptionsStorage,
  options: GameOptions,
): boolean {
  try {
    storage.setItem(GAME_OPTIONS_KEY, JSON.stringify(options));
    return true;
  } catch {
    return false;
  }
}

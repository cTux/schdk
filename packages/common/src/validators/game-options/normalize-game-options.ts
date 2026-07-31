import { DEFAULT_GAME_OPTIONS } from '../../constants/game-options/default-game-options.js';
import { DEFAULT_GAME_LAYOUT } from '../../constants/game-options/default-game-layout.js';
import { GAME_IMAGE_POSITIONS } from '../../constants/game-options/game-image-positions.js';
import { GAME_LAYOUT_ELEMENT_IDS } from '../../constants/game-options/game-layout-element-ids.js';
import { MAX_CUSTOM_GAME_ELEMENTS } from '../../constants/game-options/max-custom-game-elements.js';
import { MAX_CUSTOM_IMAGE_DATA_LENGTH } from '../../constants/game-options/max-custom-image-data-length.js';
import { type CustomGameElement } from '../../types/game-options/custom-game-element.js';
import { type GameLayout } from '../../types/game-options/game-layout.js';
import { type GameLayoutPosition } from '../../types/game-options/game-layout-position.js';
import { type GameOptions } from '../../types/game-options/game-options.js';

export function normalizeGameOptions(value: unknown): GameOptions | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<GameOptions>;
  const autoFullscreen = candidate.autoFullscreen ?? true;
  const musicVolume = candidate.musicVolume ?? DEFAULT_GAME_OPTIONS.musicVolume;
  const hasValidFullscreen = typeof autoFullscreen === 'boolean';
  const hasValidSoundVolume =
    typeof candidate.soundVolume === 'number' &&
    candidate.soundVolume >= 0 &&
    candidate.soundVolume <= 1;
  const hasValidMusicVolume =
    typeof musicVolume === 'number' && musicVolume >= 0 && musicVolume <= 1;
  if (!hasValidFullscreen || !hasValidSoundVolume || !hasValidMusicVolume) {
    return null;
  }
  const layout = normalizeGameLayout(candidate.layout);
  if (candidate.layout !== undefined && candidate.layout !== null && !layout) {
    return null;
  }
  const backgroundImage = candidate.backgroundImage ?? null;
  const backgroundOpacity = candidate.backgroundOpacity ?? 1;
  const customElements = normalizeCustomElements(candidate.customElements);
  const hasValidCustomElements = Boolean(customElements);
  const hasValidBackground =
    isBackgroundImage(backgroundImage) && isOpacity(backgroundOpacity);
  if (!hasValidCustomElements || !hasValidBackground) {
    return null;
  }
  return {
    autoFullscreen,
    soundVolume: candidate.soundVolume as number,
    musicVolume,
    layout,
    customElements: customElements as CustomGameElement[],
    backgroundImage,
    backgroundOpacity,
  };
}

function normalizeCustomElements(value: unknown): CustomGameElement[] | null {
  if (value === undefined) return [];
  const hasValidElementCount =
    Array.isArray(value) && value.length <= MAX_CUSTOM_GAME_ELEMENTS;
  if (!hasValidElementCount) return null;
  const ids = new Set<string>();
  let imageDataLength = 0;
  const normalized: CustomGameElement[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') return null;
    const candidate = entry as Record<string, unknown>;
    const { id, kind, position } = candidate;
    const hasUniqueId = typeof id === 'string' && id.length > 0 && !ids.has(id);
    const hasValidPosition = isGameLayoutPosition(position);
    if (!hasUniqueId || !hasValidPosition) {
      return null;
    }
    const rawPosition = position as Record<string, unknown>;
    const normalizedPosition = {
      ...rawPosition,
      hidden: rawPosition.hidden ?? false,
    };
    if (!isGameLayoutElement(normalizedPosition)) return null;
    ids.add(id);
    const isValidTextElement =
      kind === 'text' &&
      typeof candidate.text === 'string' &&
      candidate.text.length >= 1 &&
      candidate.text.length <= 500;
    if (isValidTextElement) {
      normalized.push({
        id: id as string,
        kind,
        text: candidate.text as string,
        position: normalizedPosition,
      });
      continue;
    }
    const isValidImageElement =
      kind === 'image' && isBackgroundImage(candidate.image ?? null);
    if (isValidImageElement) {
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
  const needsAlternativeAnswerPosition =
    positions['alternative-answer'] === undefined &&
    isGameLayoutPosition(positions.answer);
  if (needsAlternativeAnswerPosition) {
    const answerPosition = positions.answer as { x: number; y: number };
    positions['alternative-answer'] = {
      ...DEFAULT_GAME_LAYOUT['alternative-answer'],
      x: answerPosition.x,
      y: Math.max(0, answerPosition.y - 18),
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
  const hasValidHorizontalPosition =
    typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 100;
  const hasValidVerticalPosition =
    typeof y === 'number' && Number.isFinite(y) && y >= 0 && y <= 100;
  return hasValidHorizontalPosition && hasValidVerticalPosition;
}

function isGameLayoutElement(value: unknown): value is GameLayoutPosition {
  if (!isGameLayoutPosition(value)) return false;
  const position = value as Record<string, unknown>;
  const hasValidSize =
    isPercentage(position.width) && isPercentage(position.height);
  const hasValidVisibility = typeof position.hidden === 'boolean';
  const hasValidFontScale =
    typeof position.fontScale === 'number' &&
    Number.isFinite(position.fontScale) &&
    position.fontScale >= 0.5 &&
    position.fontScale <= 2;
  const hasValidTextSettings =
    typeof position.fitTextToHeight === 'boolean' &&
    typeof position.textColor === 'string' &&
    /^#[\da-f]{6}$/i.test(position.textColor);
  const hasValidTextDirection =
    position.textGrowDirection === 'up' ||
    position.textGrowDirection === 'down';
  const hasValidImagePosition =
    typeof position.imagePosition === 'string' &&
    GAME_IMAGE_POSITIONS.includes(
      position.imagePosition as (typeof GAME_IMAGE_POSITIONS)[number],
    );
  return (
    hasValidSize &&
    hasValidVisibility &&
    hasValidFontScale &&
    hasValidTextSettings &&
    hasValidTextDirection &&
    hasValidImagePosition
  );
}

function isBackgroundImage(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === 'string' &&
      value.length <= MAX_CUSTOM_IMAGE_DATA_LENGTH &&
      value.startsWith('data:image/'))
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

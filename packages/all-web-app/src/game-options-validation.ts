import {
  DEFAULT_GAME_OPTIONS,
  DEFAULT_GAME_LAYOUT,
  GAME_IMAGE_POSITIONS,
  GAME_LAYOUT_ELEMENT_IDS,
  MAX_CUSTOM_GAME_ELEMENTS,
  MAX_CUSTOM_IMAGE_DATA_LENGTH,
  type CustomGameElement,
  type GameLayout,
  type GameLayoutPosition,
  type GameOptions,
} from '@schdk/ui/options';

export function normalizeGameOptions(value: unknown): GameOptions | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<GameOptions>;
  const autoFullscreen = candidate.autoFullscreen ?? true;
  const musicVolume = candidate.musicVolume ?? DEFAULT_GAME_OPTIONS.musicVolume;
  if (
    typeof autoFullscreen !== 'boolean' ||
    typeof candidate.soundVolume !== 'number' ||
    candidate.soundVolume < 0 ||
    candidate.soundVolume > 1 ||
    typeof musicVolume !== 'number' ||
    musicVolume < 0 ||
    musicVolume > 1
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
    autoFullscreen,
    soundVolume: candidate.soundVolume,
    musicVolume,
    layout,
    customElements,
    backgroundImage,
    backgroundOpacity,
  };
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

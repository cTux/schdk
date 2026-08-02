import { MAX_CUSTOM_GAME_ELEMENTS } from '../../constants/game-options/max-custom-game-elements.js';
import { MAX_CUSTOM_IMAGE_DATA_LENGTH } from '../../constants/game-options/max-custom-image-data-length.js';
import { getDefaultCustomElementPosition } from '../../factories/game-options/get-default-custom-element-position.js';
import { type CustomGameElement } from '../../types/game-options/custom-game-element.js';
import {
  isGameLayoutElement,
  isGameLayoutPosition,
} from './is-game-layout-element.js';

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
    if (
      kind === 'text' &&
      typeof candidate.text === 'string' &&
      candidate.text.length >= 1 &&
      candidate.text.length <= 500
    ) {
      const normalizedPosition = normalizePosition(position, kind);
      if (!normalizedPosition) return null;
      ids.add(id);
      normalized.push({
        id,
        kind,
        text: candidate.text,
        position: normalizedPosition,
      });
      continue;
    }
    const image = candidate.image ?? null;
    if (kind === 'image' && isBackgroundImage(image)) {
      const normalizedPosition = normalizePosition(position, kind);
      if (!normalizedPosition) return null;
      ids.add(id);
      imageDataLength += image?.length ?? 0;
      if (imageDataLength > MAX_CUSTOM_IMAGE_DATA_LENGTH) return null;
      normalized.push({ id, kind, image, position: normalizedPosition });
      continue;
    }
    return null;
  }
  return normalized;
}

function normalizePosition(position: unknown, kind: CustomGameElement['kind']) {
  const normalized = {
    ...getDefaultCustomElementPosition(kind),
    ...(position as Record<string, unknown>),
  };
  delete (normalized as Record<string, unknown>).fitTextToHeight;
  return isGameLayoutElement(normalized) ? normalized : null;
}

function isBackgroundImage(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === 'string' &&
      value.length <= MAX_CUSTOM_IMAGE_DATA_LENGTH &&
      value.startsWith('data:image/'))
  );
}

export { isBackgroundImage, normalizeCustomElements };

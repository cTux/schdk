import { GAME_IMAGE_POSITIONS } from '../../constants/game-options/game-image-positions.js';
import { type GameLayoutPosition } from '../../types/game-options/game-layout-position.js';

function isGameLayoutPosition(
  value: unknown,
): value is { x: number; y: number } {
  if (!value || typeof value !== 'object') return false;
  const { x, y } = value as Record<string, unknown>;
  return isPosition(x) && isPosition(y);
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

function isPosition(value: unknown) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

function isPercentage(value: unknown) {
  return typeof value === 'number' && isPosition(value) && value >= 2;
}

export { isGameLayoutElement, isGameLayoutPosition };

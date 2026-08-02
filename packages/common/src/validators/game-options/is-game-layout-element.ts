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
    isColor(position.textColor) &&
    (position.textAlign === 'left' ||
      position.textAlign === 'center' ||
      position.textAlign === 'right' ||
      position.textAlign === 'justify') &&
    typeof position.textBold === 'boolean' &&
    typeof position.textItalic === 'boolean' &&
    typeof position.textUnderline === 'boolean' &&
    isNumberBetween(position.lineHeight, 0.8, 2) &&
    isNumberBetween(position.letterSpacing, -0.1, 0.5) &&
    (position.textGrowDirection === 'up' ||
      position.textGrowDirection === 'center' ||
      position.textGrowDirection === 'down') &&
    typeof position.imagePosition === 'string' &&
    GAME_IMAGE_POSITIONS.includes(
      position.imagePosition as (typeof GAME_IMAGE_POSITIONS)[number],
    ) &&
    (position.backgroundColor === null || isColor(position.backgroundColor)) &&
    (position.backgroundGradientColor === null ||
      isColor(position.backgroundGradientColor)) &&
    Number.isInteger(position.backgroundGradientDirection) &&
    isNumberBetween(position.backgroundGradientDirection, 0, 359) &&
    isNumberBetween(position.backgroundOpacity, 0, 1) &&
    isNumberBetween(position.borderRadius, 0, 50) &&
    isNumberBetween(position.contentOpacity, 0, 1)
  );
}

function isColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
}

function isNumberBetween(value: unknown, minimum: number, maximum: number) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
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

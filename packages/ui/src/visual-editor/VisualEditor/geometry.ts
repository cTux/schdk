import {
  getDefaultCustomElementPosition,
  type CustomGameElement,
  type GameLayoutPosition,
} from '../../options/types';
import type { GamePoint, ResizeHandle } from './types';

const clamp = (value: number) => Math.min(100, Math.max(0, value));
const clampZoom = (value: number) => Math.min(2.5, Math.max(0.5, value));
const clampSize = (value: number) => Math.min(100, Math.max(2, value));

export const getNextZoom = (current: number, deltaY: number) =>
  clampZoom(current * (deltaY < 0 ? 1.1 : 0.9));

export function getDraggedPosition(
  startPosition: GamePoint,
  startPointer: GamePoint,
  pointer: GamePoint,
): GamePoint {
  return {
    x: clamp(startPosition.x + pointer.x - startPointer.x),
    y: clamp(startPosition.y + pointer.y - startPointer.y),
  };
}

export function getResizedPosition(
  start: GameLayoutPosition,
  startPointer: GamePoint,
  pointer: GamePoint,
  handle: ResizeHandle,
): Pick<GameLayoutPosition, 'x' | 'y' | 'width' | 'height'> {
  const horizontalDelta = pointer.x - startPointer.x;
  const verticalDelta = pointer.y - startPointer.y;
  const fromLeft = handle.includes('left');
  const fromRight = handle.includes('right');
  const fromTop = handle.includes('top');
  const fromBottom = handle.includes('bottom');
  const width = fromLeft
    ? clampSize(start.width - horizontalDelta)
    : fromRight
      ? clampSize(start.width + horizontalDelta)
      : start.width;
  const height = fromTop
    ? clampSize(start.height - verticalDelta)
    : fromBottom
      ? clampSize(start.height + verticalDelta)
      : start.height;
  return {
    x: clamp(
      start.x +
        (fromLeft
          ? (start.width - width) / 2
          : fromRight
            ? (width - start.width) / 2
            : 0),
    ),
    y: clamp(
      start.y +
        (fromTop
          ? (start.height - height) / 2
          : fromBottom
            ? (height - start.height) / 2
            : 0),
    ),
    width,
    height,
  };
}

export function createCustomElement(
  kind: CustomGameElement['kind'],
  index: number,
  id: string = crypto.randomUUID(),
  text = '\u0422\u0435\u043a\u0441\u0442',
): CustomGameElement {
  const base = {
    id,
    position: getDefaultCustomElementPosition(kind, (index % 6) * 3),
  };
  return kind === 'text'
    ? { ...base, kind, text }
    : { ...base, kind, image: null };
}

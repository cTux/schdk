import { type GameLayoutPosition } from '../../options/types';
import type { GamePoint, ResizeHandle } from './types';
import { clamp } from './clamp';

const clampSize = (value: number) => Math.min(100, Math.max(2, value));

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

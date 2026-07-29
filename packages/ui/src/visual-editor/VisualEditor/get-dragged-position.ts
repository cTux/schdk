import type { GamePoint } from './types';
import { clamp } from './clamp';

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

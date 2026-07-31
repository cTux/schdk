import { type CustomGameElement } from '../../types/game-options/custom-game-element.js';
import { type GameLayoutPosition } from '../../types/game-options/game-layout-position.js';
import { layout } from '../../utils/game-options/layout.js';

export function getDefaultCustomElementPosition(
  kind: CustomGameElement['kind'],
  offset = 0,
): GameLayoutPosition {
  return layout(
    Math.min(76, 50 + offset),
    Math.min(76, 50 + offset),
    24,
    kind === 'text' ? 10 : 24,
  );
}

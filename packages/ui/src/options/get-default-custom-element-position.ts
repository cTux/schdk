import { type CustomGameElement } from './custom-game-element';
import { type GameLayoutPosition } from './game-layout-position';
import { layout } from './layout';

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

import { type GameLayoutPosition } from './game-layout-position';

export function layout(
  x: number,
  y: number,
  width: number,
  height: number,
  textColor = '#f1f3f6',
): GameLayoutPosition {
  return {
    hidden: false,
    x,
    y,
    width,
    height,
    fontScale: 1,
    fitTextToHeight: false,
    textColor,
    textGrowDirection: 'down',
    imagePosition: 'right bottom',
  };
}

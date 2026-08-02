import { type GameLayoutPosition } from '../../types/game-options/game-layout-position.js';

export function layout(
  x: number,
  y: number,
  width: number,
  height: number,
  textColor = '#f1f3f6',
  textAlign: GameLayoutPosition['textAlign'] = 'left',
): GameLayoutPosition {
  return {
    hidden: false,
    x,
    y,
    width,
    height,
    fontScale: 1,
    textColor,
    textAlign,
    textBold: false,
    textItalic: false,
    textUnderline: false,
    lineHeight: 1.2,
    letterSpacing: 0,
    textGrowDirection: 'down',
    imagePosition: 'right bottom',
    backgroundColor: null,
    backgroundGradientColor: null,
    backgroundGradientDirection: 90,
    backgroundOpacity: 1,
    borderRadius: 0,
    contentOpacity: 1,
  };
}

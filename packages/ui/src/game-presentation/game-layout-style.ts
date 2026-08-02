import type { CSSProperties } from 'react';
import type { GameLayoutPosition } from '../options/types';

export function getGameLayoutStyle(
  position: GameLayoutPosition,
): CSSProperties {
  const background = getElementBackground(position);
  return {
    '--game-layout-x': `${position.x}%`,
    '--game-layout-y': `${position.y}%`,
    '--game-layout-width': `${position.width}%`,
    '--game-layout-height': `${position.height}%`,
    '--game-font-scale': position.fontScale,
    '--game-text-color': position.textColor,
    '--game-text-align': position.textAlign,
    '--game-text-items-align':
      position.textAlign === 'left'
        ? 'flex-start'
        : position.textAlign === 'right'
          ? 'flex-end'
          : position.textAlign === 'justify'
            ? 'stretch'
            : 'center',
    '--game-font-weight': position.textBold ? 700 : 400,
    '--game-font-style': position.textItalic ? 'italic' : 'normal',
    '--game-text-decoration': position.textUnderline ? 'underline' : 'none',
    '--game-line-height': position.lineHeight,
    '--game-letter-spacing': `${position.letterSpacing}em`,
    '--game-grow-align':
      position.textGrowDirection === 'up'
        ? 'flex-end'
        : position.textGrowDirection === 'center'
          ? 'center'
          : 'flex-start',
    '--game-image-position': position.imagePosition,
    '--game-element-background': background,
    '--game-element-radius': `${position.borderRadius}%`,
    '--game-content-opacity': position.contentOpacity,
  } as CSSProperties;
}

function getElementBackground(position: GameLayoutPosition) {
  if (!position.backgroundColor) return 'transparent';
  const from = withOpacity(
    position.backgroundColor,
    position.backgroundOpacity,
  );
  if (!position.backgroundGradientColor) return from;
  const to = withOpacity(
    position.backgroundGradientColor,
    position.backgroundOpacity,
  );
  return `linear-gradient(${position.backgroundGradientDirection}deg, ${from}, ${to})`;
}

function withOpacity(color: string, opacity: number) {
  return `${color}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

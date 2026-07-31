import type { CSSProperties } from 'react';
import type { GameLayoutPosition } from '../options/types';

export function getGameLayoutStyle(
  position: GameLayoutPosition,
): CSSProperties {
  return {
    '--game-layout-x': `${position.x}%`,
    '--game-layout-y': `${position.y}%`,
    '--game-layout-width': `${position.width}%`,
    '--game-layout-height': `${position.height}%`,
    '--game-font-scale': position.fontScale,
    '--game-text-color': position.textColor,
    '--game-grow-align':
      position.textGrowDirection === 'up' ? 'flex-end' : 'flex-start',
    '--game-image-position': position.imagePosition,
  } as CSSProperties;
}

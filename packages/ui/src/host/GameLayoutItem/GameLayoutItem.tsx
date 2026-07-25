import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { FitTextObserver } from '../FitTextObserver';
import type { GameLayoutItemProps } from './types';

export function GameLayoutItem({ children, id, layout }: GameLayoutItemProps) {
  const position = layout?.[id];
  if (position?.hidden) return null;
  const style = position
    ? ({
        '--game-layout-x': `${position.x}%`,
        '--game-layout-y': `${position.y}%`,
        '--game-layout-width': `${position.width}%`,
        '--game-layout-height': `${position.height}%`,
        '--game-font-scale': position.fontScale,
        '--game-text-color': position.textColor,
        '--game-grow-align':
          position.textGrowDirection === 'up' ? 'flex-end' : 'flex-start',
        '--game-image-position': position.imagePosition,
      } as CSSProperties)
    : undefined;
  return (
    <div
      className={classNames('game-layout-item', `game-layout-${id}`, {
        'has-position': position,
      })}
      style={style}
    >
      {children}
      <FitTextObserver enabled={position?.fitTextToHeight ?? false} />
    </div>
  );
}

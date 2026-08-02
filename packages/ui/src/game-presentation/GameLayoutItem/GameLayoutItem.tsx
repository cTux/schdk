import classNames from 'classnames';
import { getGameLayoutStyle } from '../game-layout-style';
import type { GameLayoutItemProps } from './types';

export function GameLayoutItem({ children, id, layout }: GameLayoutItemProps) {
  const position = layout?.[id];
  if (position?.hidden) return null;
  const style = position ? getGameLayoutStyle(position) : undefined;
  return (
    <div
      className={classNames('game-layout-item', `game-layout-${id}`, {
        'has-position': position,
      })}
      style={style}
    >
      {children}
    </div>
  );
}

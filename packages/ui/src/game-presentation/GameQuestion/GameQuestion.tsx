import classNames from 'classnames';
import { type ElementProps } from '../GameElements/element-props';

export function GameQuestion({ children, className }: ElementProps) {
  return (
    <div className={classNames('game-question', className)}>{children}</div>
  );
}

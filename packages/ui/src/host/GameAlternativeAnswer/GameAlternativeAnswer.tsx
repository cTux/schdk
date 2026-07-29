import classNames from 'classnames';
import { type ElementProps } from '../GameElements/element-props';

export function GameAlternativeAnswer({ children, className }: ElementProps) {
  return (
    <p className={classNames('game-alternative-answer', className)}>
      {children}
    </p>
  );
}

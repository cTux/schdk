import classNames from 'classnames';
import { type ElementProps } from '../GameElements/element-props';

export function GameAnswerComment({ children, className }: ElementProps) {
  return (
    <p className={classNames('game-answer-comment', className)}>{children}</p>
  );
}

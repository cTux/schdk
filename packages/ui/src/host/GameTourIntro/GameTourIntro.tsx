import './styles.scss';

import classNames from 'classnames';
import type { GameTourIntroProps } from './types';

export function GameTourIntro({
  className,
  phrase,
  title,
}: GameTourIntroProps) {
  return (
    <div className={classNames('question-intro', 'tour-intro', className)}>
      <strong>{title}</strong>
      {phrase && <span>{phrase}</span>}
    </div>
  );
}

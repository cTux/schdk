import classNames from 'classnames';
import type { Handout } from '@schdk/common';
import { LOCALIZATION_COPY, type LocalizationCopy } from '../../localization';

export function GameHandout({
  copy = LOCALIZATION_COPY.uk,
  handout,
  className,
}: {
  copy?: LocalizationCopy;
  handout?: Handout;
  className?: string;
}) {
  const handoutClasses = classNames('game-handout', className);
  if (handout?.kind === 'text') {
    return (
      <div className={classNames(handoutClasses, 'game-handout-text')}>
        <p>{handout.text}</p>
      </div>
    );
  }
  return handout ? (
    <img
      className={handoutClasses}
      src={handout.dataUrl}
      alt={copy.host.handoutAlt}
    />
  ) : (
    <div className={classNames(handoutClasses, 'game-handout-placeholder')}>
      {copy.shared.handout}
    </div>
  );
}

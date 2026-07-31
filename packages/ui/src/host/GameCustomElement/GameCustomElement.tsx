import classNames from 'classnames';
import { useLocalization } from '../../localization';
import type { CustomGameElement } from '../../options/types';
import { FitTextObserver } from '../FitTextObserver';
import { getGameLayoutStyle } from '../game-layout-style';

export function GameCustomElement({
  element,
  preview = false,
}: {
  element: CustomGameElement;
  preview?: boolean;
}) {
  const { copy } = useLocalization();
  const { position } = element;
  if (position.hidden && !preview) return null;
  return (
    <div
      className={classNames(
        'game-custom-element',
        `game-custom-${element.kind}`,
      )}
      style={getGameLayoutStyle(position)}
    >
      {element.kind === 'text' ? (
        <p>{element.text}</p>
      ) : element.image ? (
        <img src={element.image} alt="" />
      ) : preview ? (
        <span className="game-custom-image-placeholder" aria-hidden="true">
          {copy.shared.image}
        </span>
      ) : null}
      {element.kind === 'text' && (
        <FitTextObserver enabled={position.fitTextToHeight} />
      )}
    </div>
  );
}

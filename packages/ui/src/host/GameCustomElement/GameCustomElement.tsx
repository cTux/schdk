import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { useLocalization } from '../../localization';
import type { CustomGameElement } from '../../options/types';
import { FitTextObserver } from '../FitTextObserver';

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
      style={
        {
          '--game-layout-x': `${position.x}%`,
          '--game-layout-y': `${position.y}%`,
          '--game-layout-width': `${position.width}%`,
          '--game-layout-height': `${position.height}%`,
          '--game-font-scale': position.fontScale,
          '--game-text-color': position.textColor,
          '--game-grow-align':
            position.textGrowDirection === 'up' ? 'flex-end' : 'flex-start',
          '--game-image-position': position.imagePosition,
        } as CSSProperties
      }
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

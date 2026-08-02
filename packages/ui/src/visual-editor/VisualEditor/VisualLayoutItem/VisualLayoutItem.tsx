import classNames from 'classnames';
import { getGameLayoutStyle } from '../../../game-presentation/game-layout-style';
import { RESIZE_HANDLES } from '../constants';
import type { VisualLayoutItemProps } from './types';
import { useLayoutTransform } from './use-layout-transform';

export function VisualLayoutItem({
  content,
  hiddenLabel,
  hiddenSuffix,
  dragInstruction,
  label,
  position,
  selected,
  selection,
  onRemove,
  onSelect,
  onUpdate,
  pointerPosition,
}: VisualLayoutItemProps) {
  const transform = useLayoutTransform({
    position,
    pointerPosition,
    onSelect,
    onUpdate,
  });

  return (
    <div
      role="button"
      tabIndex={0}
      className={classNames(
        'visual-layout-item',
        selection.kind === 'built-in'
          ? `visual-layout-${selection.id}`
          : 'visual-layout-custom',
        {
          'is-dragging': transform.dragging,
          'is-resizing': transform.resizing,
          'is-selected': selected,
          'is-hidden': transform.renderedPosition.hidden,
        },
      )}
      style={getGameLayoutStyle(transform.renderedPosition)}
      data-hidden-label={hiddenLabel}
      aria-label={`${label}${transform.renderedPosition.hidden ? hiddenSuffix : ''}. ${dragInstruction}`}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        const isSelectionKey = event.key === 'Enter' || event.key === ' ';
        const isCustomElementDeletion =
          event.key === 'Delete' &&
          selection.kind === 'custom' &&
          event.target === event.currentTarget;
        if (isSelectionKey) {
          event.preventDefault();
          onSelect();
        } else if (isCustomElementDeletion) {
          event.preventDefault();
          onRemove();
        } else {
          transform.moveFromKeyboard(event);
        }
      }}
      onPointerDown={transform.startDrag}
      onPointerMove={transform.previewDrag}
      onPointerUp={transform.finishDrag}
      onPointerCancel={transform.cancelDrag}
    >
      {content}
      {selected &&
        RESIZE_HANDLES.map((handle) => (
          <span
            key={handle}
            className={classNames('visual-layout-resize-edge', `is-${handle}`)}
            aria-hidden="true"
            {...transform.resizeHandlers(handle)}
          />
        ))}
    </div>
  );
}

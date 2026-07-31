import classNames from 'classnames';
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { FitTextObserver } from '../../../host/FitTextObserver';
import type { GameLayoutPosition } from '../../../options/types';
import { RESIZE_HANDLES } from '../constants';
import { getDraggedPosition, getResizedPosition } from '../utils/geometry';
import type { GamePoint, ResizeHandle } from '../types';
import type { VisualLayoutItemProps } from './types';

export function VisualLayoutItem({
  content,
  fitWarningLabel,
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
  const dragRef = useRef<{
    pointerId: number;
    startPointer: GamePoint;
    startPosition: GamePoint;
  } | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    startPointer: GamePoint;
    startPosition: GameLayoutPosition;
    handle: ResizeHandle;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  function moveFromKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    const delta = event.shiftKey ? 5 : 1;
    const movement = {
      ArrowLeft: { x: -delta, y: 0 },
      ArrowRight: { x: delta, y: 0 },
      ArrowUp: { x: 0, y: -delta },
      ArrowDown: { x: 0, y: delta },
    }[event.key];
    if (!movement) return;
    event.preventDefault();
    onUpdate({
      x: Math.min(100, Math.max(0, position.x + movement.x)),
      y: Math.min(100, Math.max(0, position.y + movement.y)),
    });
  }

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
          'is-dragging': dragging,
          'is-resizing': resizing,
          'is-selected': selected,
          'is-hidden': position.hidden,
        },
      )}
      style={
        {
          left: `${position.x}%`,
          top: `${position.y}%`,
          width: `${position.width}%`,
          height: `${position.height}%`,
          '--game-font-scale': position.fontScale,
          '--game-text-color': position.textColor,
          '--game-grow-align':
            position.textGrowDirection === 'up' ? 'flex-end' : 'flex-start',
          '--game-image-position': position.imagePosition,
        } as CSSProperties
      }
      data-hidden-label={hiddenLabel}
      aria-label={`${label}${position.hidden ? hiddenSuffix : ''}. ${dragInstruction}`}
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
          moveFromKeyboard(event);
        }
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        const startPointer = pointerPosition(event);
        if (!startPointer) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
          pointerId: event.pointerId,
          startPointer,
          startPosition: position,
        };
        setDragging(true);
        onSelect();
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        const pointer = pointerPosition(event);
        const hasActiveDrag =
          drag && drag.pointerId === event.pointerId && pointer;
        if (!hasActiveDrag) return;
        onUpdate(
          getDraggedPosition(drag.startPosition, drag.startPointer, pointer),
        );
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        dragRef.current = null;
        setDragging(false);
      }}
      onPointerCancel={() => {
        dragRef.current = null;
        setDragging(false);
      }}
    >
      {content}
      {selection.kind === 'built-in' && (
        <FitTextObserver
          enabled={position.fitTextToHeight}
          warningLabel={fitWarningLabel}
        />
      )}
      {selected &&
        RESIZE_HANDLES.map((handle) => (
          <span
            key={handle}
            className={classNames('visual-layout-resize-edge', `is-${handle}`)}
            aria-hidden="true"
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.stopPropagation();
              const startPointer = pointerPosition(event);
              if (!startPointer) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              resizeRef.current = {
                pointerId: event.pointerId,
                startPointer,
                startPosition: position,
                handle,
              };
              setResizing(true);
            }}
            onPointerMove={(event) => {
              const resize = resizeRef.current;
              const pointer = pointerPosition(event);
              const hasActiveResize =
                resize && resize.pointerId === event.pointerId && pointer;
              if (!hasActiveResize) return;
              onUpdate(
                getResizedPosition(
                  resize.startPosition,
                  resize.startPointer,
                  pointer,
                  resize.handle,
                ),
              );
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              resizeRef.current = null;
              setResizing(false);
            }}
            onPointerCancel={() => {
              resizeRef.current = null;
              setResizing(false);
            }}
          />
        ))}
    </div>
  );
}

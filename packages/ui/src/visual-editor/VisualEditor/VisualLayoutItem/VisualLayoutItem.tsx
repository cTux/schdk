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
    startPosition: GameLayoutPosition;
  } | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    startPointer: GamePoint;
    startPosition: GameLayoutPosition;
    handle: ResizeHandle;
  } | null>(null);
  const draftRef = useRef<GameLayoutPosition | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [draftPosition, setDraftPosition] = useState<GameLayoutPosition | null>(
    null,
  );
  const renderedPosition = draftPosition ?? position;

  function previewPosition(patch: Partial<GameLayoutPosition>) {
    const next = { ...position, ...patch };
    draftRef.current = next;
    setDraftPosition(next);
  }

  function finishPointerInteraction(commit: boolean) {
    if (commit && draftRef.current) onUpdate(draftRef.current);
    draftRef.current = null;
    setDraftPosition(null);
  }

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
          'is-hidden': renderedPosition.hidden,
        },
      )}
      style={
        {
          left: `${renderedPosition.x}%`,
          top: `${renderedPosition.y}%`,
          width: `${renderedPosition.width}%`,
          height: `${renderedPosition.height}%`,
          '--game-font-scale': renderedPosition.fontScale,
          '--game-text-color': renderedPosition.textColor,
          '--game-grow-align':
            renderedPosition.textGrowDirection === 'up'
              ? 'flex-end'
              : 'flex-start',
          '--game-image-position': renderedPosition.imagePosition,
        } as CSSProperties
      }
      data-hidden-label={hiddenLabel}
      aria-label={`${label}${renderedPosition.hidden ? hiddenSuffix : ''}. ${dragInstruction}`}
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
        previewPosition(
          getDraggedPosition(drag.startPosition, drag.startPointer, pointer),
        );
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        dragRef.current = null;
        setDragging(false);
        finishPointerInteraction(true);
      }}
      onPointerCancel={() => {
        dragRef.current = null;
        setDragging(false);
        finishPointerInteraction(false);
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
              previewPosition(
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
              finishPointerInteraction(true);
            }}
            onPointerCancel={() => {
              resizeRef.current = null;
              setResizing(false);
              finishPointerInteraction(false);
            }}
          />
        ))}
    </div>
  );
}

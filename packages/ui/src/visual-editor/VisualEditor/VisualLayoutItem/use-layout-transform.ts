import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { GameLayoutPosition } from '../../../options/types';
import { getDraggedPosition, getResizedPosition } from '../utils/geometry';
import type { GamePoint, ResizeHandle } from '../types';

interface LayoutTransformOptions {
  position: GameLayoutPosition;
  pointerPosition(event: PointerEvent<HTMLElement>): GamePoint | null;
  onSelect(): void;
  onUpdate(position: GameLayoutPosition): void;
}

export function useLayoutTransform({
  position,
  pointerPosition,
  onSelect,
  onUpdate,
}: LayoutTransformOptions) {
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
      ...position,
      x: Math.min(100, Math.max(0, position.x + movement.x)),
      y: Math.min(100, Math.max(0, position.y + movement.y)),
    });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
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
  }

  function previewDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const pointer = pointerPosition(event);
    if (!drag || drag.pointerId !== event.pointerId || !pointer) return;
    previewPosition(
      getDraggedPosition(drag.startPosition, drag.startPointer, pointer),
    );
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setDragging(false);
    finishPointerInteraction(true);
  }

  function cancelDrag() {
    dragRef.current = null;
    setDragging(false);
    finishPointerInteraction(false);
  }

  function resizeHandlers(handle: ResizeHandle) {
    return {
      onPointerDown(event: PointerEvent<HTMLSpanElement>) {
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
      },
      onPointerMove(event: PointerEvent<HTMLSpanElement>) {
        const resize = resizeRef.current;
        const pointer = pointerPosition(event);
        if (!resize || resize.pointerId !== event.pointerId || !pointer) return;
        previewPosition(
          getResizedPosition(
            resize.startPosition,
            resize.startPointer,
            pointer,
            resize.handle,
          ),
        );
      },
      onPointerUp(event: PointerEvent<HTMLSpanElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        resizeRef.current = null;
        setResizing(false);
        finishPointerInteraction(true);
      },
      onPointerCancel() {
        resizeRef.current = null;
        setResizing(false);
        finishPointerInteraction(false);
      },
    };
  }

  return {
    cancelDrag,
    dragging,
    finishDrag,
    moveFromKeyboard,
    previewDrag,
    renderedPosition: draftPosition ?? position,
    resizeHandlers,
    resizing,
    startDrag,
  };
}

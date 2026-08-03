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

type LayoutInteraction =
  | { kind: 'idle' }
  | {
      kind: 'dragging';
      pointerId: number;
      startPointer: GamePoint;
      startPosition: GameLayoutPosition;
      draft: GameLayoutPosition | null;
    }
  | {
      kind: 'resizing';
      pointerId: number;
      startPointer: GamePoint;
      startPosition: GameLayoutPosition;
      handle: ResizeHandle;
      draft: GameLayoutPosition | null;
    };

const IDLE_INTERACTION: LayoutInteraction = { kind: 'idle' };

export function useLayoutTransform({
  position,
  pointerPosition,
  onSelect,
  onUpdate,
}: LayoutTransformOptions) {
  const interactionRef = useRef<LayoutInteraction>(IDLE_INTERACTION);
  const [interaction, setInteraction] =
    useState<LayoutInteraction>(IDLE_INTERACTION);

  function updateInteraction(next: LayoutInteraction) {
    interactionRef.current = next;
    setInteraction(next);
  }

  function previewPosition(patch: Partial<GameLayoutPosition>) {
    const active = interactionRef.current;
    if (active.kind === 'idle') return;
    updateInteraction({ ...active, draft: { ...position, ...patch } });
  }

  function finishPointerInteraction(
    kind: 'dragging' | 'resizing',
    commit: boolean,
    pointerId?: number,
  ) {
    const active = interactionRef.current;
    if (
      active.kind !== kind ||
      (pointerId !== undefined && active.pointerId !== pointerId)
    )
      return;
    if (commit && active.draft) onUpdate(active.draft);
    updateInteraction(IDLE_INTERACTION);
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
    updateInteraction({
      kind: 'dragging',
      pointerId: event.pointerId,
      startPointer,
      startPosition: position,
      draft: null,
    });
    onSelect();
  }

  function previewDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = interactionRef.current;
    const pointer = pointerPosition(event);
    if (
      drag.kind !== 'dragging' ||
      drag.pointerId !== event.pointerId ||
      !pointer
    )
      return;
    previewPosition(
      getDraggedPosition(drag.startPosition, drag.startPointer, pointer),
    );
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishPointerInteraction('dragging', true, event.pointerId);
  }

  function cancelDrag() {
    finishPointerInteraction('dragging', false);
  }

  function resizeHandlers(handle: ResizeHandle) {
    return {
      onPointerDown(event: PointerEvent<HTMLSpanElement>) {
        if (event.button !== 0) return;
        event.stopPropagation();
        const startPointer = pointerPosition(event);
        if (!startPointer) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        updateInteraction({
          kind: 'resizing',
          pointerId: event.pointerId,
          startPointer,
          startPosition: position,
          handle,
          draft: null,
        });
      },
      onPointerMove(event: PointerEvent<HTMLSpanElement>) {
        const resize = interactionRef.current;
        const pointer = pointerPosition(event);
        if (
          resize.kind !== 'resizing' ||
          resize.pointerId !== event.pointerId ||
          !pointer
        )
          return;
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
        finishPointerInteraction('resizing', true, event.pointerId);
      },
      onPointerCancel() {
        finishPointerInteraction('resizing', false);
      },
    };
  }

  return {
    cancelDrag,
    dragging: interaction.kind === 'dragging',
    finishDrag,
    moveFromKeyboard,
    previewDrag,
    renderedPosition:
      interaction.kind === 'idle' ? position : (interaction.draft ?? position),
    resizeHandlers,
    resizing: interaction.kind === 'resizing',
    startDrag,
  };
}

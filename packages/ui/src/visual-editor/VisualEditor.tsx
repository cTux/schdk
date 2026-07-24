import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Button } from '../atoms/Button';
import {
  DEFAULT_GAME_LAYOUT,
  GAME_LAYOUT_ELEMENT_IDS,
  type GameLayout,
  type GameLayoutElementId,
  type GameLayoutPosition,
} from '../options/types';

const LABELS: Record<GameLayoutElementId, string> = {
  intro: 'Питання №5',
  handout: 'Роздатка',
  question: 'Текст питання',
  timer: '00:42',
  'answer-comment': 'Коментар до відповіді',
  answer: 'ВІДПОВІДЬ',
  progress: '5 / 36',
  controls: '←  Space  →',
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function getDraggedPosition(
  startPosition: GameLayoutPosition,
  startPointer: GameLayoutPosition,
  pointer: GameLayoutPosition,
): GameLayoutPosition {
  return {
    x: clamp(startPosition.x + pointer.x - startPointer.x),
    y: clamp(startPosition.y + pointer.y - startPointer.y),
  };
}

interface VisualEditorProps {
  hidden: boolean;
  layout: GameLayout | null;
  onChange(layout: GameLayout | null): void;
}

export function VisualEditor({ hidden, layout, onChange }: VisualEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: GameLayoutElementId;
    pointerId: number;
    startPointer: GameLayoutPosition;
    startPosition: GameLayoutPosition;
  } | null>(null);
  const [dragging, setDragging] = useState<GameLayoutElementId | null>(null);
  const [selected, setSelected] = useState<GameLayoutElementId | null>(null);
  const positions = layout ?? DEFAULT_GAME_LAYOUT;

  function pointerPosition(event: PointerEvent<HTMLButtonElement>) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
  }

  function moveFromPointer(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const pointer = pointerPosition(event);
    if (!drag || drag.pointerId !== event.pointerId || !pointer) return;
    onChange({
      ...positions,
      [drag.id]: getDraggedPosition(
        drag.startPosition,
        drag.startPointer,
        pointer,
      ),
    });
  }

  function moveFromKeyboard(
    id: GameLayoutElementId,
    event: KeyboardEvent<HTMLButtonElement>,
  ) {
    const delta = event.shiftKey ? 5 : 1;
    const movement = {
      ArrowLeft: { x: -delta, y: 0 },
      ArrowRight: { x: delta, y: 0 },
      ArrowUp: { x: 0, y: -delta },
      ArrowDown: { x: 0, y: delta },
    }[event.key];
    if (!movement) return;
    event.preventDefault();
    onChange({
      ...positions,
      [id]: {
        x: clamp(positions[id].x + movement.x),
        y: clamp(positions[id].y + movement.y),
      },
    });
  }

  return (
    <div className="visual-editor" hidden={hidden}>
      <header className="visual-editor-header">
        <div>
          <p className="eyebrow">ЩДК</p>
          <h1>Візуальний редактор</h1>
          <p>
            Перетягуйте елементи або пересувайте їх стрілками. Макет автоматично
            застосовується під час гри.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={layout === null}
          onClick={() => onChange(null)}
        >
          Відновити стандартний макет
        </Button>
      </header>

      <div
        ref={canvasRef}
        className="visual-editor-canvas"
        aria-label="Макет екрана гри"
      >
        {GAME_LAYOUT_ELEMENT_IDS.map((id) => (
          <Button
            key={id}
            type="button"
            className={`visual-layout-item visual-layout-${id}${
              dragging === id ? ' is-dragging' : ''
            }${selected === id ? ' is-selected' : ''}`}
            style={{
              left: `${positions[id].x}%`,
              top: `${positions[id].y}%`,
            }}
            aria-label={`${LABELS[id]}. Перетягніть, щоб змінити позицію`}
            aria-pressed={selected === id}
            onClick={() => setSelected(id)}
            onKeyDown={(event) => moveFromKeyboard(id, event)}
            onPointerDown={(event) => {
              const startPointer = pointerPosition(event);
              if (!startPointer) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = {
                id,
                pointerId: event.pointerId,
                startPointer,
                startPosition: positions[id],
              };
              setDragging(id);
              setSelected(id);
            }}
            onPointerMove={moveFromPointer}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              dragRef.current = null;
              setDragging(null);
            }}
            onPointerCancel={() => {
              dragRef.current = null;
              setDragging(null);
            }}
          >
            {LABELS[id]}
          </Button>
        ))}
      </div>
    </div>
  );
}

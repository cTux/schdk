import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Button } from '../atoms/Button';
import {
  DEFAULT_GAME_LAYOUT,
  GAME_LAYOUT_ELEMENT_IDS,
  type GameLayout,
  type GameLayoutElementId,
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

interface VisualEditorProps {
  hidden: boolean;
  layout: GameLayout | null;
  onChange(layout: GameLayout | null): void;
}

export function VisualEditor({ hidden, layout, onChange }: VisualEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<GameLayoutElementId | null>(null);
  const positions = layout ?? DEFAULT_GAME_LAYOUT;

  function moveFromPointer(
    id: GameLayoutElementId,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    onChange({
      ...positions,
      [id]: {
        x: clamp(((event.clientX - bounds.left) / bounds.width) * 100),
        y: clamp(((event.clientY - bounds.top) / bounds.height) * 100),
      },
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
            }`}
            style={{
              left: `${positions[id].x}%`,
              top: `${positions[id].y}%`,
            }}
            aria-label={`${LABELS[id]}. Перетягніть, щоб змінити позицію`}
            onKeyDown={(event) => moveFromKeyboard(id, event)}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragging(id);
              moveFromPointer(id, event);
            }}
            onPointerMove={(event) => {
              if (dragging === id) moveFromPointer(id, event);
            }}
            onPointerUp={(event) => {
              event.currentTarget.releasePointerCapture(event.pointerId);
              setDragging(null);
            }}
            onPointerCancel={() => setDragging(null)}
          >
            {LABELS[id]}
          </Button>
        ))}
      </div>
    </div>
  );
}

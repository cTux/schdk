import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Button } from '../atoms/Button';
import {
  GameAnswer,
  GameAnswerComment,
  GameAlternativeAnswer,
  GameControls,
  GameHandout,
  GameProgress,
  GameQuestion,
  GameQuestionIntro,
  GameTimer,
} from '../host/GameElements';
import {
  DEFAULT_GAME_LAYOUT,
  GAME_LAYOUT_ELEMENT_IDS,
  type GameLayout,
  type GameLayoutElementId,
  type GameLayoutPosition,
} from '../options/types';
import '../styles/host.scss';

const LABELS: Record<GameLayoutElementId, string> = {
  intro: 'Питання №5',
  handout: 'Роздатка',
  question: 'Текст питання',
  timer: '00:42',
  'answer-comment': 'Коментар до відповіді',
  'alternative-answer': 'Альтернативна відповідь',
  answer: 'ВІДПОВІДЬ',
  progress: '5 / 36',
  controls: 'Кнопки керування',
};

const PREVIEWS: Record<GameLayoutElementId, ReactNode> = {
  intro: <GameQuestionIntro questionNumber={5} />,
  handout: <GameHandout />,
  question: <GameQuestion>Текст питання</GameQuestion>,
  timer: <GameTimer seconds={42} />,
  'answer-comment': (
    <GameAnswerComment>Коментар до відповіді</GameAnswerComment>
  ),
  'alternative-answer': (
    <GameAlternativeAnswer>Альтернативна відповідь</GameAlternativeAnswer>
  ),
  answer: <GameAnswer answer="Відповідь" />,
  progress: <GameProgress questionNumber={5} questionCount={36} />,
  controls: (
    <GameControls
      canGoBack
      controlsDisabled={false}
      preview
      onBack={() => undefined}
      onNext={() => undefined}
    />
  ),
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));
const clampZoom = (value: number) => Math.min(2.5, Math.max(0.5, value));

export function getNextZoom(current: number, deltaY: number) {
  return clampZoom(current * (deltaY < 0 ? 1.1 : 0.9));
}

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
  const workspaceRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{
    pointerId: number;
    start: { x: number; y: number };
    offset: { x: number; y: number };
  } | null>(null);
  const dragRef = useRef<{
    id: GameLayoutElementId;
    pointerId: number;
    startPointer: GameLayoutPosition;
    startPosition: GameLayoutPosition;
  } | null>(null);
  const [dragging, setDragging] = useState<GameLayoutElementId | null>(null);
  const [panning, setPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<GameLayoutElementId | null>(null);
  const positions = layout ?? DEFAULT_GAME_LAYOUT;

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((current) => getNextZoom(current, event.deltaY));
    };
    workspace.addEventListener('wheel', handleWheel, { passive: false });
    return () => workspace.removeEventListener('wheel', handleWheel);
  }, []);

  function pointerPosition(event: PointerEvent<HTMLDivElement>) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
  }

  function moveFromPointer(event: PointerEvent<HTMLDivElement>) {
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
    event: KeyboardEvent<HTMLDivElement>,
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
            застосовується під час гри. Права кнопка миші рухає екран, колесо
            змінює масштаб.
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
        ref={workspaceRef}
        className={`visual-editor-workspace${panning ? ' is-panning' : ''}`}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (event.button !== 2) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          panRef.current = {
            pointerId: event.pointerId,
            start: { x: event.clientX, y: event.clientY },
            offset: pan,
          };
          setPanning(true);
        }}
        onPointerMove={(event) => {
          const activePan = panRef.current;
          if (!activePan || activePan.pointerId !== event.pointerId) return;
          setPan({
            x: activePan.offset.x + event.clientX - activePan.start.x,
            y: activePan.offset.y + event.clientY - activePan.start.y,
          });
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          panRef.current = null;
          setPanning(false);
        }}
        onPointerCancel={() => {
          panRef.current = null;
          setPanning(false);
        }}
      >
        <div
          ref={canvasRef}
          className="visual-editor-canvas host-app"
          style={{
            transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
          aria-label="Макет екрана гри"
        >
          {GAME_LAYOUT_ELEMENT_IDS.map((id) => (
            <div
              key={id}
              role="button"
              tabIndex={0}
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
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelected(id);
                  return;
                }
                moveFromKeyboard(id, event);
              }}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
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
              {PREVIEWS[id]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

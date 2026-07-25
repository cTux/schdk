import './styles.scss';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import classNames from 'classnames';
import { Button } from '../../atoms/Button';
import {
  GameAnswer,
  GameAnswerComment,
  GameAlternativeAnswer,
  GameControls,
  GameHandout,
  GameLogo,
  GameProgress,
  GameQuestion,
  GameQuestionIntro,
  GameTimer,
} from '../../host/GameElements';
import { FitTextObserver } from '../../host/FitTextObserver';
import {
  DEFAULT_GAME_LAYOUT,
  GAME_IMAGE_POSITIONS,
  GAME_LAYOUT_ELEMENT_IDS,
  type GameLayoutElementId,
  type GameLayoutPosition,
  type GameOptions,
  type GameTextGrowDirection,
} from '../../options/types';
import { RESIZE_SIDES } from './constants';

const LABELS: Record<GameLayoutElementId, string> = {
  logo: 'Лого гри',
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
  logo: <GameLogo />,
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

const GRAPHIC_ELEMENTS = new Set<GameLayoutElementId>(['logo', 'handout']);
const IMAGE_POSITION_LABELS: Record<
  (typeof GAME_IMAGE_POSITIONS)[number],
  string
> = {
  'left top': 'Ліворуч угорі',
  'center top': 'По центру вгорі',
  'right top': 'Праворуч угорі',
  'left center': 'Ліворуч по центру',
  'center center': 'По центру',
  'right center': 'Праворуч по центру',
  'left bottom': 'Ліворуч унизу',
  'center bottom': 'По центру внизу',
  'right bottom': 'Праворуч унизу',
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));
const clampZoom = (value: number) => Math.min(2.5, Math.max(0.5, value));
const clampSize = (value: number) => Math.min(100, Math.max(2, value));
type GamePoint = Pick<GameLayoutPosition, 'x' | 'y'>;
type ResizeSide = (typeof RESIZE_SIDES)[number];

export function getNextZoom(current: number, deltaY: number) {
  return clampZoom(current * (deltaY < 0 ? 1.1 : 0.9));
}

export function getDraggedPosition(
  startPosition: GamePoint,
  startPointer: GamePoint,
  pointer: GamePoint,
): GamePoint {
  return {
    x: clamp(startPosition.x + pointer.x - startPointer.x),
    y: clamp(startPosition.y + pointer.y - startPointer.y),
  };
}

export function getResizedPosition(
  start: GameLayoutPosition,
  startPointer: GamePoint,
  pointer: GamePoint,
  side: ResizeSide,
): Pick<GameLayoutPosition, 'x' | 'y' | 'width' | 'height'> {
  const horizontalDelta = pointer.x - startPointer.x;
  const verticalDelta = pointer.y - startPointer.y;
  const width =
    side === 'left'
      ? clampSize(start.width - horizontalDelta)
      : side === 'right'
        ? clampSize(start.width + horizontalDelta)
        : start.width;
  const height =
    side === 'top'
      ? clampSize(start.height - verticalDelta)
      : side === 'bottom'
        ? clampSize(start.height + verticalDelta)
        : start.height;
  return {
    x: clamp(
      start.x +
        (side === 'left'
          ? (start.width - width) / 2
          : side === 'right'
            ? (width - start.width) / 2
            : 0),
    ),
    y: clamp(
      start.y +
        (side === 'top'
          ? (start.height - height) / 2
          : side === 'bottom'
            ? (height - start.height) / 2
            : 0),
    ),
    width,
    height,
  };
}

export interface VisualEditorProps {
  hidden: boolean;
  game: GameOptions;
  onChange(game: GameOptions): void;
}

export function VisualEditor({ hidden, game, onChange }: VisualEditorProps) {
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
    startPointer: GamePoint;
    startPosition: GamePoint;
  } | null>(null);
  const resizeRef = useRef<{
    id: GameLayoutElementId;
    pointerId: number;
    startPointer: GamePoint;
    startPosition: GameLayoutPosition;
    side: ResizeSide;
  } | null>(null);
  const [dragging, setDragging] = useState<GameLayoutElementId | null>(null);
  const [resizing, setResizing] = useState<GameLayoutElementId | null>(null);
  const [panning, setPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<GameLayoutElementId | null>(null);
  const positions = game.layout ?? DEFAULT_GAME_LAYOUT;
  const selectedPosition = selected ? positions[selected] : null;

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

  function pointerPosition(event: PointerEvent<HTMLElement>) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
  }

  function updateElement(
    id: GameLayoutElementId,
    patch: Partial<GameLayoutPosition>,
  ) {
    onChange({
      ...game,
      layout: {
        ...positions,
        [id]: { ...positions[id], ...patch },
      },
    });
  }

  function selectWorkspace() {
    setSelected(null);
    canvasRef.current?.focus();
  }

  function moveFromPointer(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const pointer = pointerPosition(event);
    if (!drag || drag.pointerId !== event.pointerId || !pointer) return;
    updateElement(
      drag.id,
      getDraggedPosition(drag.startPosition, drag.startPointer, pointer),
    );
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
    updateElement(id, {
      x: clamp(positions[id].x + movement.x),
      y: clamp(positions[id].y + movement.y),
    });
  }

  return (
    <div className="visual-editor" hidden={hidden}>
      <div
        ref={workspaceRef}
        className={classNames('visual-editor-workspace', {
          'is-panning': panning,
        })}
        onKeyDown={(event) => {
          if (event.key !== 'Escape' || !selected) return;
          event.preventDefault();
          event.stopPropagation();
          selectWorkspace();
        }}
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
        {selected && selectedPosition && (
          <aside
            className="visual-editor-toolbar"
            aria-label={`Властивості: ${LABELS[selected]}`}
          >
            <strong>{LABELS[selected]}</strong>
            {GRAPHIC_ELEMENTS.has(selected) ? (
              <label>
                Позиція зображення
                <select
                  value={selectedPosition.imagePosition}
                  onChange={(event) =>
                    updateElement(selected, {
                      imagePosition: event.target
                        .value as GameLayoutPosition['imagePosition'],
                    })
                  }
                >
                  {GAME_IMAGE_POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {IMAGE_POSITION_LABELS[position]}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <>
                <div className="visual-editor-font-size">
                  <span>Розмір тексту</span>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Зменшити текст"
                    onClick={() =>
                      updateElement(selected, {
                        fontScale: Math.max(
                          0.5,
                          selectedPosition.fontScale - 0.1,
                        ),
                      })
                    }
                  >
                    −
                  </Button>
                  <output>
                    {Math.round(selectedPosition.fontScale * 100)}%
                  </output>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Збільшити текст"
                    onClick={() =>
                      updateElement(selected, {
                        fontScale: Math.min(
                          2,
                          selectedPosition.fontScale + 0.1,
                        ),
                      })
                    }
                  >
                    +
                  </Button>
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedPosition.fitTextToHeight}
                    onChange={(event) =>
                      updateElement(selected, {
                        fitTextToHeight: event.target.checked,
                      })
                    }
                  />
                  Підлаштувати до висоти
                </label>
                <label>
                  Колір тексту
                  <input
                    type="color"
                    value={selectedPosition.textColor}
                    onChange={(event) =>
                      updateElement(selected, {
                        textColor: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Ріст тексту
                  <select
                    value={selectedPosition.textGrowDirection}
                    onChange={(event) =>
                      updateElement(selected, {
                        textGrowDirection: event.target
                          .value as GameTextGrowDirection,
                      })
                    }
                  >
                    <option value="up">Вгору</option>
                    <option value="down">Вниз</option>
                  </select>
                </label>
              </>
            )}
          </aside>
        )}
        {!selected && (
          <aside
            className="visual-editor-toolbar"
            aria-label="Властивості: Робоча область"
          >
            <strong>Робоча область</strong>
            <label className="visual-editor-background-image">
              Фонове зображення
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = '';
                  if (!file || !file.type.startsWith('image/')) return;
                  const reader = new FileReader();
                  reader.addEventListener(
                    'load',
                    () => {
                      if (typeof reader.result === 'string') {
                        onChange({ ...game, backgroundImage: reader.result });
                      }
                    },
                    { once: true },
                  );
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {game.backgroundImage && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange({ ...game, backgroundImage: null })}
              >
                Видалити фон
              </Button>
            )}
            <label className="visual-editor-background-opacity">
              Прозорість фону
              <input
                type="range"
                min="0"
                max="100"
                disabled={!game.backgroundImage}
                value={Math.round((1 - game.backgroundOpacity) * 100)}
                onChange={(event) =>
                  onChange({
                    ...game,
                    backgroundOpacity: 1 - Number(event.target.value) / 100,
                  })
                }
              />
              <output>{Math.round((1 - game.backgroundOpacity) * 100)}%</output>
            </label>
          </aside>
        )}
        <div
          ref={canvasRef}
          className={classNames('visual-editor-canvas', 'host-app', {
            'is-selected': !selected,
          })}
          tabIndex={0}
          style={
            {
              transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              '--game-surface-background-image': game.backgroundImage
                ? `url(${JSON.stringify(game.backgroundImage)})`
                : 'none',
              '--game-surface-background-opacity': game.backgroundOpacity,
            } as CSSProperties
          }
          aria-label="Макет екрана гри"
          aria-current={selected ? undefined : 'true'}
          role="region"
          onClick={(event) => {
            if (event.target === event.currentTarget) selectWorkspace();
          }}
        >
          {GAME_LAYOUT_ELEMENT_IDS.map((id) => (
            <div
              key={id}
              role="button"
              tabIndex={0}
              className={classNames(
                'visual-layout-item',
                `visual-layout-${id}`,
                {
                  'is-dragging': dragging === id,
                  'is-resizing': resizing === id,
                  'is-selected': selected === id,
                },
              )}
              style={
                {
                  left: `${positions[id].x}%`,
                  top: `${positions[id].y}%`,
                  width: `${positions[id].width}%`,
                  height: `${positions[id].height}%`,
                  '--game-font-scale': positions[id].fontScale,
                  '--game-text-color': positions[id].textColor,
                  '--game-grow-align':
                    positions[id].textGrowDirection === 'up'
                      ? 'flex-end'
                      : 'flex-start',
                  '--game-image-position': positions[id].imagePosition,
                } as CSSProperties
              }
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
              <FitTextObserver enabled={positions[id].fitTextToHeight} />
              {RESIZE_SIDES.map((side) => (
                <span
                  key={side}
                  className={classNames(
                    'visual-layout-resize-edge',
                    `is-${side}`,
                  )}
                  aria-hidden="true"
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.preventDefault();
                    event.stopPropagation();
                    const startPointer = pointerPosition(event);
                    if (!startPointer) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    resizeRef.current = {
                      id,
                      pointerId: event.pointerId,
                      startPointer,
                      startPosition: positions[id],
                      side,
                    };
                    setResizing(id);
                    setSelected(id);
                  }}
                  onPointerMove={(event) => {
                    const resize = resizeRef.current;
                    const pointer = pointerPosition(event);
                    if (
                      !resize ||
                      resize.pointerId !== event.pointerId ||
                      !pointer
                    ) {
                      return;
                    }
                    updateElement(
                      resize.id,
                      getResizedPosition(
                        resize.startPosition,
                        resize.startPointer,
                        pointer,
                        resize.side,
                      ),
                    );
                  }}
                  onPointerUp={(event) => {
                    if (
                      event.currentTarget.hasPointerCapture(event.pointerId)
                    ) {
                      event.currentTarget.releasePointerCapture(
                        event.pointerId,
                      );
                    }
                    resizeRef.current = null;
                    setResizing(null);
                  }}
                  onPointerCancel={() => {
                    resizeRef.current = null;
                    setResizing(null);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

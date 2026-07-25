import {
  faCircleHalfStroke,
  faEye,
  faEyeSlash,
  faFont,
  faImage,
  faPalette,
  faPen,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  ActionToolbar,
  ActionToolbarButton,
  ActionToolbarPopover,
  ActionToolbarSeparator,
} from '../../atoms/ActionToolbar';
import { Tooltip } from '../../atoms/Tooltip';
import {
  GameAnswer,
  GameAnswerComment,
  GameAlternativeAnswer,
  GameControls,
  GameCustomElement,
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
  MAX_CUSTOM_GAME_ELEMENTS,
  MAX_CUSTOM_IMAGE_DATA_LENGTH,
  getDefaultCustomElementPosition,
  type CustomGameElement,
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
  answer: 'Відповідь',
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
type ElementSelection =
  | { kind: 'built-in'; id: GameLayoutElementId }
  | { kind: 'custom'; id: string };

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

export function createCustomElement(
  kind: CustomGameElement['kind'],
  index: number,
  id: string = crypto.randomUUID(),
): CustomGameElement {
  const base = {
    id,
    position: getDefaultCustomElementPosition(kind, (index % 6) * 3),
  };
  return kind === 'text'
    ? { ...base, kind, text: 'Текст' }
    : { ...base, kind, image: null };
}

export interface VisualEditorProps {
  hidden: boolean;
  game: GameOptions;
  message: string;
  onChange(game: GameOptions): void;
}

export function VisualEditor({
  hidden,
  game,
  message,
  onChange,
}: VisualEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<{
    pointerId: number;
    start: { x: number; y: number };
    offset: { x: number; y: number };
  } | null>(null);
  const dragRef = useRef<{
    selection: ElementSelection;
    pointerId: number;
    startPointer: GamePoint;
    startPosition: GamePoint;
  } | null>(null);
  const resizeRef = useRef<{
    selection: ElementSelection;
    pointerId: number;
    startPointer: GamePoint;
    startPosition: GameLayoutPosition;
    side: ResizeSide;
  } | null>(null);
  const [dragging, setDragging] = useState('');
  const [resizing, setResizing] = useState('');
  const [panning, setPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<ElementSelection | null>(null);
  const [imageTarget, setImageTarget] = useState<'background' | string | null>(
    null,
  );
  const [localMessage, setLocalMessage] = useState('');
  const positions = game.layout ?? DEFAULT_GAME_LAYOUT;
  const selectedCustom =
    selected?.kind === 'custom'
      ? (game.customElements.find(({ id }) => id === selected.id) ?? null)
      : null;
  const selectedPosition = selected
    ? selected.kind === 'built-in'
      ? positions[selected.id]
      : selectedCustom?.position
    : null;

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

  function selectionKey(selection: ElementSelection) {
    return `${selection.kind}:${selection.id}`;
  }

  function positionFor(selection: ElementSelection) {
    return selection.kind === 'built-in'
      ? positions[selection.id]
      : game.customElements.find(({ id }) => id === selection.id)?.position;
  }

  function pointerPosition(event: PointerEvent<HTMLElement>) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
  }

  function updatePosition(
    selection: ElementSelection,
    patch: Partial<GameLayoutPosition>,
  ) {
    if (selection.kind === 'built-in') {
      onChange({
        ...game,
        layout: {
          ...positions,
          [selection.id]: { ...positions[selection.id], ...patch },
        },
      });
      return;
    }
    onChange({
      ...game,
      customElements: game.customElements.map((element) =>
        element.id === selection.id
          ? { ...element, position: { ...element.position, ...patch } }
          : element,
      ),
    });
  }

  function updateCustom(id: string, patch: Partial<CustomGameElement>) {
    onChange({
      ...game,
      customElements: game.customElements.map((element) =>
        element.id === id
          ? ({ ...element, ...patch } as CustomGameElement)
          : element,
      ),
    });
  }

  function selectWorkspace() {
    setSelected(null);
    canvasRef.current?.focus();
  }

  function addElement(kind: CustomGameElement['kind']) {
    if (game.customElements.length >= MAX_CUSTOM_GAME_ELEMENTS) {
      setLocalMessage('Можна додати не більше 20 власних елементів.');
      return;
    }
    const element = createCustomElement(kind, game.customElements.length);
    setLocalMessage('');
    onChange({
      ...game,
      customElements: [...game.customElements, element],
    });
    setSelected({ kind: 'custom', id: element.id });
    if (kind === 'image') chooseImage(element.id);
  }

  function removeCustom(id: string) {
    onChange({
      ...game,
      customElements: game.customElements.filter(
        (element) => element.id !== id,
      ),
    });
    selectWorkspace();
  }

  function chooseImage(target: 'background' | string) {
    setImageTarget(target);
    fileInputRef.current?.click();
  }

  function applyImage(dataUrl: string) {
    if (imageTarget === 'background') {
      onChange({ ...game, backgroundImage: dataUrl });
      return;
    }
    if (!imageTarget) return;
    const otherImageDataLength = game.customElements.reduce(
      (total, element) =>
        total +
        (element.kind === 'image' && element.id !== imageTarget && element.image
          ? element.image.length
          : 0),
      0,
    );
    if (otherImageDataLength + dataUrl.length > MAX_CUSTOM_IMAGE_DATA_LENGTH) {
      setLocalMessage(
        'Зображення завеликі для збереження. Видаліть одне з них або виберіть менший файл.',
      );
      return;
    }
    updateCustom(imageTarget, { image: dataUrl });
  }

  function moveFromPointer(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const pointer = pointerPosition(event);
    if (!drag || drag.pointerId !== event.pointerId || !pointer) return;
    updatePosition(
      drag.selection,
      getDraggedPosition(drag.startPosition, drag.startPointer, pointer),
    );
  }

  function moveFromKeyboard(
    selection: ElementSelection,
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    const delta = event.shiftKey ? 5 : 1;
    const movement = {
      ArrowLeft: { x: -delta, y: 0 },
      ArrowRight: { x: delta, y: 0 },
      ArrowUp: { x: 0, y: -delta },
      ArrowDown: { x: 0, y: delta },
    }[event.key];
    const position = positionFor(selection);
    if (!movement || !position) return;
    event.preventDefault();
    updatePosition(selection, {
      x: clamp(position.x + movement.x),
      y: clamp(position.y + movement.y),
    });
  }

  function renderLayoutItem(
    selection: ElementSelection,
    position: GameLayoutPosition,
    label: string,
    content: ReactNode,
  ) {
    const key = selectionKey(selection);
    return (
      <div
        key={key}
        role="button"
        tabIndex={0}
        className={`visual-layout-item${
          selection.kind === 'built-in'
            ? ` visual-layout-${selection.id}`
            : ' visual-layout-custom'
        }${dragging === key ? ' is-dragging' : ''}${
          resizing === key ? ' is-resizing' : ''
        }${selected && selectionKey(selected) === key ? ' is-selected' : ''}${
          position.hidden ? ' is-hidden' : ''
        }`}
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
        aria-label={`${label}${position.hidden ? '. Приховано у грі' : ''}. Перетягніть, щоб змінити позицію`}
        aria-pressed={selected ? selectionKey(selected) === key : false}
        onClick={() => setSelected(selection)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setSelected(selection);
            return;
          }
          if (
            event.key === 'Delete' &&
            selection.kind === 'custom' &&
            event.target === event.currentTarget
          ) {
            event.preventDefault();
            removeCustom(selection.id);
            return;
          }
          moveFromKeyboard(selection, event);
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const startPointer = pointerPosition(event);
          if (!startPointer) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            selection,
            pointerId: event.pointerId,
            startPointer,
            startPosition: position,
          };
          setDragging(key);
          setSelected(selection);
        }}
        onPointerMove={moveFromPointer}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          dragRef.current = null;
          setDragging('');
        }}
        onPointerCancel={() => {
          dragRef.current = null;
          setDragging('');
        }}
      >
        {content}
        {selection.kind === 'built-in' && (
          <FitTextObserver enabled={position.fitTextToHeight} />
        )}
        {RESIZE_SIDES.map((side) => (
          <span
            key={side}
            className={`visual-layout-resize-edge is-${side}`}
            aria-hidden="true"
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.stopPropagation();
              const startPointer = pointerPosition(event);
              if (!startPointer) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              resizeRef.current = {
                selection,
                pointerId: event.pointerId,
                startPointer,
                startPosition: position,
                side,
              };
              setResizing(key);
              setSelected(selection);
            }}
            onPointerMove={(event) => {
              const resize = resizeRef.current;
              const pointer = pointerPosition(event);
              if (!resize || resize.pointerId !== event.pointerId || !pointer) {
                return;
              }
              updatePosition(
                resize.selection,
                getResizedPosition(
                  resize.startPosition,
                  resize.startPointer,
                  pointer,
                  resize.side,
                ),
              );
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              resizeRef.current = null;
              setResizing('');
            }}
            onPointerCancel={() => {
              resizeRef.current = null;
              setResizing('');
            }}
          />
        ))}
      </div>
    );
  }

  function textSettings(
    selection: ElementSelection,
    position: GameLayoutPosition,
  ) {
    return (
      <ActionToolbarPopover icon={faPalette} label="Оформлення тексту">
        <h2>Оформлення тексту</h2>
        <label>
          Розмір
          <input
            type="range"
            min="50"
            max="200"
            value={Math.round(position.fontScale * 100)}
            onChange={(event) =>
              updatePosition(selection, {
                fontScale: Number(event.target.value) / 100,
              })
            }
          />
          <output>{Math.round(position.fontScale * 100)}%</output>
        </label>
        <label>
          Колір
          <input
            type="color"
            value={position.textColor}
            onChange={(event) =>
              updatePosition(selection, { textColor: event.target.value })
            }
          />
        </label>
        <label>
          Напрямок
          <select
            value={position.textGrowDirection}
            onChange={(event) =>
              updatePosition(selection, {
                textGrowDirection: event.target.value as GameTextGrowDirection,
              })
            }
          >
            <option value="up">Вгору</option>
            <option value="down">Вниз</option>
          </select>
        </label>
        <label>
          Підлаштувати до висоти
          <input
            type="checkbox"
            checked={position.fitTextToHeight}
            onChange={(event) =>
              updatePosition(selection, {
                fitTextToHeight: event.target.checked,
              })
            }
          />
        </label>
      </ActionToolbarPopover>
    );
  }

  function imagePositionSettings(
    selection: ElementSelection,
    position: GameLayoutPosition,
  ) {
    return (
      <ActionToolbarPopover
        icon={faCircleHalfStroke}
        label="Позиція зображення"
      >
        <h2>Позиція зображення</h2>
        <label>
          Вирівнювання
          <select
            value={position.imagePosition}
            onChange={(event) =>
              updatePosition(selection, {
                imagePosition: event.target
                  .value as GameLayoutPosition['imagePosition'],
              })
            }
          >
            {GAME_IMAGE_POSITIONS.map((positionName) => (
              <option key={positionName} value={positionName}>
                {IMAGE_POSITION_LABELS[positionName]}
              </option>
            ))}
          </select>
        </label>
      </ActionToolbarPopover>
    );
  }

  function contextualToolbar() {
    if (!selected || !selectedPosition) {
      return (
        <ActionToolbar label="Дії з робочою областю">
          <ActionToolbarButton
            icon={faImage}
            label={
              game.backgroundImage ? 'Замінити фон' : 'Застосувати зображення'
            }
            onClick={() => chooseImage('background')}
          />
          {game.backgroundImage && (
            <ActionToolbarButton
              danger
              icon={faTrashCan}
              label="Видалити фон"
              onClick={() => onChange({ ...game, backgroundImage: null })}
            />
          )}
          <ActionToolbarPopover
            icon={faCircleHalfStroke}
            label="Прозорість фону"
          >
            <h2>Прозорість фону</h2>
            <label>
              Прозорість
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
          </ActionToolbarPopover>
        </ActionToolbar>
      );
    }

    if (selected.kind === 'built-in') {
      return (
        <ActionToolbar label={`Дії: ${LABELS[selected.id]}`}>
          {GRAPHIC_ELEMENTS.has(selected.id)
            ? imagePositionSettings(selected, selectedPosition)
            : textSettings(selected, selectedPosition)}
          <ActionToolbarSeparator />
          <ActionToolbarButton
            icon={selectedPosition.hidden ? faEye : faEyeSlash}
            label={
              selectedPosition.hidden ? 'Показати у грі' : 'Приховати у грі'
            }
            pressed={selectedPosition.hidden}
            onClick={() =>
              updatePosition(selected, { hidden: !selectedPosition.hidden })
            }
          />
        </ActionToolbar>
      );
    }

    if (!selectedCustom) return null;
    return (
      <ActionToolbar
        label={`Дії: ${
          selectedCustom.kind === 'text' ? 'Власний текст' : 'Власне зображення'
        }`}
      >
        {selectedCustom.kind === 'text' ? (
          <>
            <ActionToolbarPopover icon={faPen} label="Змінити текст">
              <h2>Змінити текст</h2>
              <label htmlFor="visual-editor-custom-text">Текст</label>
              <textarea
                id="visual-editor-custom-text"
                maxLength={500}
                value={selectedCustom.text}
                onChange={(event) => {
                  if (event.target.value.length > 0) {
                    updateCustom(selectedCustom.id, {
                      text: event.target.value,
                    });
                  }
                }}
              />
            </ActionToolbarPopover>
            {textSettings(selected, selectedPosition)}
          </>
        ) : (
          <>
            <ActionToolbarButton
              icon={faImage}
              label={
                selectedCustom.image
                  ? 'Замінити зображення'
                  : 'Застосувати зображення'
              }
              onClick={() => chooseImage(selectedCustom.id)}
            />
            <ActionToolbarButton
              danger
              disabled={!selectedCustom.image}
              icon={faTrashCan}
              label="Видалити зображення"
              onClick={() => updateCustom(selectedCustom.id, { image: null })}
            />
            {imagePositionSettings(selected, selectedPosition)}
          </>
        )}
        <ActionToolbarSeparator />
        <ActionToolbarButton
          icon={selectedPosition.hidden ? faEye : faEyeSlash}
          label={selectedPosition.hidden ? 'Показати у грі' : 'Приховати у грі'}
          pressed={selectedPosition.hidden}
          onClick={() =>
            updatePosition(selected, { hidden: !selectedPosition.hidden })
          }
        />
        <ActionToolbarButton
          danger
          icon={faTrashCan}
          label="Видалити елемент"
          onClick={() => removeCustom(selectedCustom.id)}
        />
      </ActionToolbar>
    );
  }

  return (
    <div className="visual-editor" hidden={hidden}>
      <aside className="visual-editor-add-panel" aria-label="Додати елемент">
        <Tooltip
          label="Додати редагований текст на екран гри"
          side="right"
          trigger={
            <button
              className="visual-editor-add-button"
              type="button"
              aria-label="Додати редагований текст на екран гри"
              onClick={() => addElement('text')}
            >
              <FontAwesomeIcon icon={faFont} aria-hidden="true" />
            </button>
          }
        />
        <Tooltip
          label="Додати власне зображення або логотип"
          side="right"
          trigger={
            <button
              className="visual-editor-add-button"
              type="button"
              aria-label="Додати власне зображення або логотип"
              onClick={() => addElement('image')}
            >
              <FontAwesomeIcon icon={faImage} aria-hidden="true" />
            </button>
          }
        />
      </aside>
      <div
        ref={workspaceRef}
        className={`visual-editor-workspace${panning ? ' is-panning' : ''}`}
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
        <div className="visual-editor-toolbar">{contextualToolbar()}</div>
        <input
          ref={fileInputRef}
          className="visual-editor-file-input"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (!file) return;
            if (!file.type.startsWith('image/')) {
              setLocalMessage('Оберіть файл зображення.');
              return;
            }
            const reader = new FileReader();
            reader.addEventListener(
              'load',
              () => {
                if (typeof reader.result === 'string') {
                  setLocalMessage('');
                  applyImage(reader.result);
                }
              },
              { once: true },
            );
            reader.readAsDataURL(file);
          }}
        />
        <div
          ref={canvasRef}
          className={`visual-editor-canvas host-app${
            selected ? '' : ' is-selected'
          }`}
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
          {GAME_LAYOUT_ELEMENT_IDS.map((id) =>
            renderLayoutItem(
              { kind: 'built-in', id },
              positions[id],
              LABELS[id],
              PREVIEWS[id],
            ),
          )}
          {game.customElements.map((element) =>
            renderLayoutItem(
              { kind: 'custom', id: element.id },
              element.position,
              element.kind === 'text' ? 'Власний текст' : 'Власне зображення',
              <GameCustomElement element={element} preview />,
            ),
          )}
        </div>
        {(localMessage || message) && (
          <p className="visual-editor-message" role="alert">
            {localMessage || message}
          </p>
        )}
      </div>
    </div>
  );
}
import './styles.scss';

import {
  faCircleHalfStroke,
  faEye,
  faEyeSlash,
  faFileExport,
  faFileImport,
  faFont,
  faImage,
  faPalette,
  faPen,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
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
import { useLocalization } from '../../localization';
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
import { RESIZE_HANDLES } from './constants';

const GRAPHIC_ELEMENTS = new Set<GameLayoutElementId>(['logo', 'handout']);

const clamp = (value: number) => Math.min(100, Math.max(0, value));
const clampZoom = (value: number) => Math.min(2.5, Math.max(0.5, value));
const clampSize = (value: number) => Math.min(100, Math.max(2, value));
type GamePoint = Pick<GameLayoutPosition, 'x' | 'y'>;
type ResizeHandle = (typeof RESIZE_HANDLES)[number];
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
  handle: ResizeHandle,
): Pick<GameLayoutPosition, 'x' | 'y' | 'width' | 'height'> {
  const horizontalDelta = pointer.x - startPointer.x;
  const verticalDelta = pointer.y - startPointer.y;
  const fromLeft = handle.includes('left');
  const fromRight = handle.includes('right');
  const fromTop = handle.includes('top');
  const fromBottom = handle.includes('bottom');
  const width = fromLeft
    ? clampSize(start.width - horizontalDelta)
    : fromRight
      ? clampSize(start.width + horizontalDelta)
      : start.width;
  const height = fromTop
    ? clampSize(start.height - verticalDelta)
    : fromBottom
      ? clampSize(start.height + verticalDelta)
      : start.height;
  return {
    x: clamp(
      start.x +
        (fromLeft
          ? (start.width - width) / 2
          : fromRight
            ? (width - start.width) / 2
            : 0),
    ),
    y: clamp(
      start.y +
        (fromTop
          ? (start.height - height) / 2
          : fromBottom
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
  text = 'Текст',
): CustomGameElement {
  const base = {
    id,
    position: getDefaultCustomElementPosition(kind, (index % 6) * 3),
  };
  return kind === 'text'
    ? { ...base, kind, text }
    : { ...base, kind, image: null };
}

export interface VisualEditorProps {
  hidden: boolean;
  game: GameOptions;
  message: string;
  onChange(game: GameOptions): void;
  onImportTemplate(file: File): void;
  onExportTemplate(): void;
}

export function VisualEditor({
  hidden,
  game,
  message,
  onChange,
  onImportTemplate,
  onExportTemplate,
}: VisualEditorProps) {
  const { copy } = useLocalization();
  const labels: Record<GameLayoutElementId, string> = {
    logo: copy.visualEditor.labels.logo,
    intro: copy.visualEditor.labels.intro,
    handout: copy.visualEditor.labels.handout,
    question: copy.visualEditor.labels.question,
    timer: copy.visualEditor.labels.timer,
    'answer-comment': copy.visualEditor.labels.answerComment,
    'alternative-answer': copy.visualEditor.labels.alternativeAnswer,
    answer: copy.visualEditor.labels.answer,
    progress: copy.visualEditor.labels.progress,
    controls: copy.visualEditor.labels.controls,
  };
  const previews: Record<GameLayoutElementId, ReactNode> = {
    logo: <GameLogo />,
    intro: <GameQuestionIntro questionNumber={5} />,
    handout: <GameHandout copy={copy} />,
    question: <GameQuestion>{copy.visualEditor.previewText}</GameQuestion>,
    timer: <GameTimer seconds={42} />,
    'answer-comment': (
      <GameAnswerComment>{copy.shared.answerComment}</GameAnswerComment>
    ),
    'alternative-answer': (
      <GameAlternativeAnswer>
        {copy.editor.alternativeAnswers}
      </GameAlternativeAnswer>
    ),
    answer: <GameAnswer answer={copy.shared.answer} />,
    progress: <GameProgress questionNumber={5} questionCount={36} />,
    controls: (
      <GameControls
        copy={copy}
        canGoBack
        controlsDisabled={false}
        preview
        onBack={() => undefined}
        onNext={() => undefined}
      />
    ),
  };
  const imagePositionLabels: Record<
    (typeof GAME_IMAGE_POSITIONS)[number],
    string
  > = {
    'left top': copy.visualEditor.alignments.leftTop,
    'center top': copy.visualEditor.alignments.centerTop,
    'right top': copy.visualEditor.alignments.rightTop,
    'left center': copy.visualEditor.alignments.leftCenter,
    'center center': copy.visualEditor.alignments.centerCenter,
    'right center': copy.visualEditor.alignments.rightCenter,
    'left bottom': copy.visualEditor.alignments.leftBottom,
    'center bottom': copy.visualEditor.alignments.centerBottom,
    'right bottom': copy.visualEditor.alignments.rightBottom,
  };
  const canvasRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
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
    handle: ResizeHandle;
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
      setLocalMessage(copy.visualEditor.customLimit);
      return;
    }
    const element = createCustomElement(
      kind,
      game.customElements.length,
      undefined,
      copy.visualEditor.customText,
    );
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
      setLocalMessage(copy.visualEditor.imagesTooLarge);
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
    const isSelected = selected ? selectionKey(selected) === key : false;
    return (
      <div
        key={key}
        role="button"
        tabIndex={0}
        className={classNames(
          'visual-layout-item',
          selection.kind === 'built-in'
            ? `visual-layout-${selection.id}`
            : 'visual-layout-custom',
          {
            'is-dragging': dragging === key,
            'is-resizing': resizing === key,
            'is-selected': isSelected,
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
        data-hidden-label={copy.visualEditor.hidden}
        aria-label={`${label}${position.hidden ? copy.visualEditor.hiddenSuffix : ''}. ${copy.visualEditor.dragInstruction}`}
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
        {isSelected &&
          RESIZE_HANDLES.map((handle) => (
            <span
              key={handle}
              className={classNames(
                'visual-layout-resize-edge',
                `is-${handle}`,
              )}
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
                  handle,
                };
                setResizing(key);
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
                updatePosition(
                  resize.selection,
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
      <ActionToolbarPopover
        icon={faPalette}
        label={copy.visualEditor.textFormatting}
      >
        <h2>{copy.visualEditor.textFormatting}</h2>
        <label>
          {copy.visualEditor.size}
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
          {copy.visualEditor.color}
          <input
            type="color"
            value={position.textColor}
            onChange={(event) =>
              updatePosition(selection, { textColor: event.target.value })
            }
          />
        </label>
        <label>
          {copy.visualEditor.direction}
          <select
            value={position.textGrowDirection}
            onChange={(event) =>
              updatePosition(selection, {
                textGrowDirection: event.target.value as GameTextGrowDirection,
              })
            }
          >
            <option value="up">{copy.visualEditor.up}</option>
            <option value="down">{copy.visualEditor.down}</option>
          </select>
        </label>
        <label>
          {copy.visualEditor.fitHeight}
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
        label={copy.visualEditor.imagePosition}
      >
        <h2>{copy.visualEditor.imagePosition}</h2>
        <label>
          {copy.visualEditor.alignment}
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
                {imagePositionLabels[positionName]}
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
        <ActionToolbar label={copy.visualEditor.workspaceActions}>
          <ActionToolbarButton
            icon={faImage}
            label={
              game.backgroundImage
                ? copy.visualEditor.replaceBackground
                : copy.visualEditor.applyImage
            }
            onClick={() => chooseImage('background')}
          />
          {game.backgroundImage && (
            <ActionToolbarButton
              danger
              icon={faTrashCan}
              label={copy.visualEditor.removeBackground}
              onClick={() => onChange({ ...game, backgroundImage: null })}
            />
          )}
          <ActionToolbarPopover
            icon={faCircleHalfStroke}
            label={copy.visualEditor.backgroundOpacity}
          >
            <h2>{copy.visualEditor.backgroundOpacity}</h2>
            <label>
              {copy.visualEditor.opacity}
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
        <ActionToolbar label={copy.visualEditor.actions(labels[selected.id])}>
          {GRAPHIC_ELEMENTS.has(selected.id)
            ? imagePositionSettings(selected, selectedPosition)
            : textSettings(selected, selectedPosition)}
          <ActionToolbarSeparator />
          <ActionToolbarButton
            icon={selectedPosition.hidden ? faEye : faEyeSlash}
            label={
              selectedPosition.hidden
                ? copy.visualEditor.showInGame
                : copy.visualEditor.hideInGame
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
        label={copy.visualEditor.actions(
          selectedCustom.kind === 'text'
            ? copy.visualEditor.ownText
            : copy.visualEditor.ownImage,
        )}
      >
        {selectedCustom.kind === 'text' ? (
          <>
            <ActionToolbarPopover
              icon={faPen}
              label={copy.visualEditor.editText}
            >
              <h2>{copy.visualEditor.editText}</h2>
              <label htmlFor="visual-editor-custom-text">
                {copy.visualEditor.text}
              </label>
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
                  ? copy.visualEditor.replaceImage
                  : copy.visualEditor.applyImage
              }
              onClick={() => chooseImage(selectedCustom.id)}
            />
            <ActionToolbarButton
              danger
              disabled={!selectedCustom.image}
              icon={faTrashCan}
              label={copy.visualEditor.removeImage}
              onClick={() => updateCustom(selectedCustom.id, { image: null })}
            />
            {imagePositionSettings(selected, selectedPosition)}
          </>
        )}
        <ActionToolbarSeparator />
        <ActionToolbarButton
          icon={selectedPosition.hidden ? faEye : faEyeSlash}
          label={
            selectedPosition.hidden
              ? copy.visualEditor.showInGame
              : copy.visualEditor.hideInGame
          }
          pressed={selectedPosition.hidden}
          onClick={() =>
            updatePosition(selected, { hidden: !selectedPosition.hidden })
          }
        />
        <ActionToolbarButton
          danger
          icon={faTrashCan}
          label={copy.visualEditor.removeElement}
          onClick={() => removeCustom(selectedCustom.id)}
        />
      </ActionToolbar>
    );
  }

  return (
    <div className="visual-editor" hidden={hidden}>
      <aside
        className="visual-editor-add-panel"
        aria-label={copy.visualEditor.addElement}
      >
        <Tooltip
          label={copy.visualEditor.addText}
          side="right"
          trigger={
            <button
              className="visual-editor-add-button"
              type="button"
              aria-label={copy.visualEditor.addText}
              onClick={() => addElement('text')}
            >
              <FontAwesomeIcon icon={faFont} aria-hidden="true" />
            </button>
          }
        />
        <Tooltip
          label={copy.visualEditor.addImage}
          side="right"
          trigger={
            <button
              className="visual-editor-add-button"
              type="button"
              aria-label={copy.visualEditor.addImage}
              onClick={() => addElement('image')}
            >
              <FontAwesomeIcon icon={faImage} aria-hidden="true" />
            </button>
          }
        />
        <Tooltip
          label={copy.visualEditor.importTemplate}
          side="right"
          trigger={
            <button
              className={classNames(
                'visual-editor-add-button',
                'visual-editor-import-button',
              )}
              type="button"
              aria-label={copy.visualEditor.importTemplate}
              onClick={() => templateInputRef.current?.click()}
            >
              <FontAwesomeIcon icon={faFileImport} aria-hidden="true" />
            </button>
          }
        />
        <Tooltip
          label={copy.visualEditor.exportTemplate}
          side="right"
          trigger={
            <button
              className="visual-editor-add-button"
              type="button"
              aria-label={copy.visualEditor.exportTemplate}
              onClick={onExportTemplate}
            >
              <FontAwesomeIcon icon={faFileExport} aria-hidden="true" />
            </button>
          }
        />
        <input
          ref={templateInputRef}
          className="visual-editor-file-input"
          type="file"
          hidden
          accept=".schdk-template,application/json"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) onImportTemplate(file);
          }}
        />
      </aside>
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
              setLocalMessage(copy.visualEditor.chooseImage);
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
          aria-label={copy.visualEditor.gameLayout}
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
              labels[id],
              previews[id],
            ),
          )}
          {game.customElements.map((element) =>
            renderLayoutItem(
              { kind: 'custom', id: element.id },
              element.position,
              element.kind === 'text'
                ? copy.visualEditor.ownText
                : copy.visualEditor.ownImage,
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

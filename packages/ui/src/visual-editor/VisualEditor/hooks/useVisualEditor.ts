import {
  useEffect,
  useReducer,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import type { LocalizationCopy } from '../../../localization';
import {
  DEFAULT_GAME_LAYOUT,
  type CustomGameElement,
  type GameLayoutPosition,
  type GamePresentationOptions,
} from '../../../options/types';
import {
  addVisualEditorElement,
  removeVisualEditorElement,
  updateVisualEditorElement,
  updateVisualEditorPosition,
} from '../utils/update-visual-editor-game';
import type { ElementSelection, GamePoint } from '../types';
import { applyVisualEditorImage } from '../utils/apply-visual-editor-image';
import { readVisualEditorImage } from '../utils/read-visual-editor-image';
import {
  INITIAL_VISUAL_EDITOR_STATE,
  reduceVisualEditor,
} from './visual-editor-state';

export function useVisualEditor(
  game: GamePresentationOptions,
  copy: LocalizationCopy,
  onChange: (game: GamePresentationOptions) => void,
  history: {
    canRedo: boolean;
    canUndo: boolean;
    onRedo(): void;
    onUndo(): void;
  },
) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<{
    pointerId: number;
    start: { x: number; y: number };
    offset: { x: number; y: number };
  } | null>(null);
  const [state, dispatch] = useReducer(
    reduceVisualEditor,
    INITIAL_VISUAL_EDITOR_STATE,
  );
  const setPan = (pan: GamePoint) => dispatch({ type: 'pan', pan });
  const setPanning = (panning: boolean) =>
    dispatch({ type: 'panning', panning });
  const setSelected = (selected: ElementSelection | null) =>
    dispatch({ type: 'select', selected });
  const setLocalMessage = (localMessage: string) =>
    dispatch({ type: 'message', message: localMessage });
  const positions = game.layout ?? DEFAULT_GAME_LAYOUT;
  const selected = state.selected;
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
      dispatch({ type: 'zoom', delta: event.deltaY });
    };
    workspace.addEventListener('wheel', handleWheel, { passive: false });
    return () => workspace.removeEventListener('wheel', handleWheel);
  }, []);

  function pointerPosition(event: PointerEvent<HTMLElement>): GamePoint | null {
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
    onChange(updateVisualEditorPosition(game, selection, patch));
  }

  function updateCustom(id: string, patch: Partial<CustomGameElement>) {
    onChange(updateVisualEditorElement(game, id, patch));
  }

  function selectWorkspace() {
    setSelected(null);
    canvasRef.current?.focus();
  }

  function chooseImage(target: 'background' | string) {
    dispatch({ type: 'choose-image', target });
    fileInputRef.current?.click();
  }

  function addElement(kind: CustomGameElement['kind']) {
    const added = addVisualEditorElement(
      game,
      kind,
      copy.visualEditor.customText,
    );
    if (!added) {
      setLocalMessage(copy.visualEditor.customLimit);
      return;
    }
    setLocalMessage('');
    onChange(added.game);
    setSelected({ kind: 'custom', id: added.element.id });
    if (kind === 'image') chooseImage(added.element.id);
  }

  function removeCustom(id: string) {
    onChange(removeVisualEditorElement(game, id));
    selectWorkspace();
  }

  function applyImage(dataUrl: string) {
    if (!state.imageTarget) return;
    const updated = applyVisualEditorImage(game, state.imageTarget, dataUrl);
    if (!updated) {
      setLocalMessage(copy.visualEditor.imagesTooLarge);
      return;
    }
    onChange(updated);
  }

  function handleWorkspaceKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const isEditable =
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable);
    const hasUndoModifier = (event.ctrlKey || event.metaKey) && !event.altKey;
    const isUndo =
      hasUndoModifier && event.key.toLowerCase() === 'z' && !event.shiftKey;
    const isRedo =
      hasUndoModifier &&
      (event.key.toLowerCase() === 'y' ||
        (event.key.toLowerCase() === 'z' && event.shiftKey));
    if (!isEditable && (isUndo || isRedo)) {
      event.preventDefault();
      if (isUndo && history.canUndo) history.onUndo();
      if (isRedo && history.canRedo) history.onRedo();
      return;
    }
    if (event.key !== 'Escape' || !selected) return;
    event.preventDefault();
    event.stopPropagation();
    selectWorkspace();
  }

  function startPan(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 2) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    panRef.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      offset: state.pan,
    };
    setPanning(true);
  }

  function previewPan(event: PointerEvent<HTMLDivElement>) {
    const activePan = panRef.current;
    if (!activePan || activePan.pointerId !== event.pointerId) return;
    setPan({
      x: activePan.offset.x + event.clientX - activePan.start.x,
      y: activePan.offset.y + event.clientY - activePan.start.y,
    });
  }

  function finishPan(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    panRef.current = null;
    setPanning(false);
  }

  function cancelPan() {
    panRef.current = null;
    setPanning(false);
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLocalMessage(copy.visualEditor.chooseImage);
      return;
    }
    try {
      const dataUrl = await readVisualEditorImage(file);
      setLocalMessage('');
      applyImage(dataUrl);
    } catch {
      setLocalMessage(copy.visualEditor.imagesTooLarge);
    }
  }

  return {
    addElement,
    cancelPan,
    canvasRef,
    chooseImage,
    fileInputRef,
    finishPan,
    handleImageChange,
    handleWorkspaceKeyDown,
    localMessage: state.localMessage,
    pan: state.pan,
    panning: state.panning,
    pointerPosition,
    previewPan,
    positions,
    removeCustom,
    selectWorkspace,
    selected,
    selectedCustom,
    selectedPosition,
    setSelected,
    startPan,
    updateCustom,
    updatePosition,
    workspaceRef,
    zoom: state.zoom,
  };
}

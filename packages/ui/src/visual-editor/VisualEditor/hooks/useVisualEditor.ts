import { useEffect, useReducer, useRef, type PointerEvent } from 'react';
import type { LocalizationCopy } from '../../../localization';
import {
  DEFAULT_GAME_LAYOUT,
  MAX_CUSTOM_GAME_ELEMENTS,
  type CustomGameElement,
  type GameLayoutPosition,
  type GameOptions,
} from '../../../options/types';
import { createCustomElement } from '../utils/geometry';
import {
  removeVisualEditorElement,
  updateVisualEditorElement,
  updateVisualEditorPosition,
} from '../utils/update-visual-editor-game';
import type { ElementSelection, GamePoint } from '../types';
import { applyVisualEditorImage } from '../utils/apply-visual-editor-image';
import {
  INITIAL_VISUAL_EDITOR_STATE,
  reduceVisualEditor,
} from './visual-editor-state';

export function useVisualEditor(
  game: GameOptions,
  copy: LocalizationCopy,
  onChange: (game: GameOptions) => void,
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
    onChange({ ...game, customElements: [...game.customElements, element] });
    setSelected({ kind: 'custom', id: element.id });
    if (kind === 'image') chooseImage(element.id);
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

  return {
    addElement,
    applyImage,
    canvasRef,
    chooseImage,
    fileInputRef,
    localMessage: state.localMessage,
    pan: state.pan,
    panRef,
    panning: state.panning,
    pointerPosition,
    positions,
    removeCustom,
    selectWorkspace,
    selected,
    selectedCustom,
    selectedPosition,
    setLocalMessage,
    setPan,
    setPanning,
    setSelected,
    updateCustom,
    updatePosition,
    workspaceRef,
    zoom: state.zoom,
  };
}

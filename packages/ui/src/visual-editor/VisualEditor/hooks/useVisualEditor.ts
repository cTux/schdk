import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { LocalizationCopy } from '../../../localization';
import {
  DEFAULT_GAME_LAYOUT,
  MAX_CUSTOM_GAME_ELEMENTS,
  MAX_CUSTOM_IMAGE_DATA_LENGTH,
  type CustomGameElement,
  type GameLayoutPosition,
  type GameOptions,
} from '../../../options/types';
import { createCustomElement, getNextZoom } from '../utils/geometry';
import {
  removeVisualEditorElement,
  updateVisualEditorElement,
  updateVisualEditorPosition,
} from '../utils/update-visual-editor-game';
import type { ElementSelection, GamePoint } from '../types';

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
    setImageTarget(target);
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
    if (dataUrl.length > MAX_CUSTOM_IMAGE_DATA_LENGTH) {
      setLocalMessage(copy.visualEditor.imagesTooLarge);
      return;
    }
    if (imageTarget === 'background') {
      onChange({ ...game, backgroundImage: dataUrl });
      return;
    }
    if (!imageTarget) return;
    const otherImageDataLength = game.customElements.reduce(
      (total, element) => {
        const isOtherImage =
          element.kind === 'image' &&
          element.id !== imageTarget &&
          element.image;
        return total + (isOtherImage ? element.image!.length : 0);
      },
      0,
    );
    if (otherImageDataLength + dataUrl.length > MAX_CUSTOM_IMAGE_DATA_LENGTH) {
      setLocalMessage(copy.visualEditor.imagesTooLarge);
      return;
    }
    updateCustom(imageTarget, { image: dataUrl });
  }

  return {
    addElement,
    applyImage,
    canvasRef,
    chooseImage,
    fileInputRef,
    localMessage,
    pan,
    panRef,
    panning,
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
    zoom,
  };
}

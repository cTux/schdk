import {
  DEFAULT_GAME_LAYOUT,
  MAX_CUSTOM_GAME_ELEMENTS,
  type CustomGameElement,
  type GameLayoutPosition,
  type GamePresentationOptions,
} from '../../../options/types';
import type { ElementSelection } from '../types';
import { createCustomElement } from './create-custom-element';

function addVisualEditorElement(
  game: GamePresentationOptions,
  kind: CustomGameElement['kind'],
  text: string,
  id?: string,
) {
  if (game.customElements.length >= MAX_CUSTOM_GAME_ELEMENTS) return null;
  const element = createCustomElement(
    kind,
    game.customElements.length,
    id,
    text,
  );
  return {
    element,
    game: { ...game, customElements: [...game.customElements, element] },
  };
}

function updateVisualEditorPosition(
  game: GamePresentationOptions,
  selection: ElementSelection,
  patch: Partial<GameLayoutPosition>,
) {
  const positions = game.layout ?? DEFAULT_GAME_LAYOUT;
  if (selection.kind === 'built-in') {
    return {
      ...game,
      layout: {
        ...positions,
        [selection.id]: { ...positions[selection.id], ...patch },
      },
    };
  }
  const element = game.customElements.find(({ id }) => id === selection.id);
  return element
    ? updateVisualEditorElement(game, selection.id, {
        position: { ...element.position, ...patch },
      })
    : game;
}

function updateVisualEditorElement(
  game: GamePresentationOptions,
  id: string,
  patch: Partial<CustomGameElement>,
) {
  return {
    ...game,
    customElements: game.customElements.map((element) =>
      element.id === id
        ? ({ ...element, ...patch } as CustomGameElement)
        : element,
    ),
  };
}

function removeVisualEditorElement(game: GamePresentationOptions, id: string) {
  return {
    ...game,
    customElements: game.customElements.filter((element) => element.id !== id),
  };
}

export {
  addVisualEditorElement,
  removeVisualEditorElement,
  updateVisualEditorElement,
  updateVisualEditorPosition,
};

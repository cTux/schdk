import {
  DEFAULT_GAME_LAYOUT,
  type CustomGameElement,
  type GameLayoutPosition,
  type GamePresentationOptions,
} from '../../../options/types';
import type { ElementSelection } from '../types';

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
  removeVisualEditorElement,
  updateVisualEditorElement,
  updateVisualEditorPosition,
};

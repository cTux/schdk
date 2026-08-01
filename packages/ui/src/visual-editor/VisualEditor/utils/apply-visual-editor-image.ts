import {
  MAX_CUSTOM_IMAGE_DATA_LENGTH,
  type GamePresentationOptions,
} from '../../../options/types';
import { updateVisualEditorElement } from './update-visual-editor-game';

function applyVisualEditorImage(
  game: GamePresentationOptions,
  target: 'background' | string,
  dataUrl: string,
): GamePresentationOptions | null {
  if (dataUrl.length > MAX_CUSTOM_IMAGE_DATA_LENGTH) return null;
  if (target === 'background') return { ...game, backgroundImage: dataUrl };

  const otherImageDataLength = game.customElements.reduce(
    (total, element) =>
      total +
      (element.kind === 'image' && element.id !== target && element.image
        ? element.image.length
        : 0),
    0,
  );
  return otherImageDataLength + dataUrl.length <= MAX_CUSTOM_IMAGE_DATA_LENGTH
    ? updateVisualEditorElement(game, target, { image: dataUrl })
    : null;
}

export { applyVisualEditorImage };

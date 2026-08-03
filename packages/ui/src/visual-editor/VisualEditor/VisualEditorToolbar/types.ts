import type { LocalizationCopy } from '../../../localization';
import type {
  CustomGameElement,
  GameLayoutElementId,
  GameLayoutPosition,
  GamePresentationOptions,
} from '../../../options/types';
import type { ElementSelection } from '../types';

export interface VisualEditorToolbarProps {
  copy: LocalizationCopy;
  game: GamePresentationOptions;
  labels: Record<GameLayoutElementId, string>;
  selection: {
    element: ElementSelection | null;
    custom: CustomGameElement | null;
    position: GameLayoutPosition | null;
  };
  actions: {
    chooseImage(target: 'background' | string): void;
    commitChange(): void;
    onChange(
      game: GamePresentationOptions,
      options?: { continuous?: boolean },
    ): void;
    removeCustom(id: string): void;
    updateCustom(
      id: string,
      patch: Partial<CustomGameElement>,
      continuous?: boolean,
    ): void;
    updatePosition(
      selection: ElementSelection,
      patch: Partial<GameLayoutPosition>,
      continuous?: boolean,
    ): void;
  };
}

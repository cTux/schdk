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
  selected: ElementSelection | null;
  selectedCustom: CustomGameElement | null;
  selectedPosition: GameLayoutPosition | null;
  chooseImage(target: 'background' | string): void;
  onChange(game: GamePresentationOptions): void;
  removeCustom(id: string): void;
  updateCustom(id: string, patch: Partial<CustomGameElement>): void;
  updatePosition(
    selection: ElementSelection,
    patch: Partial<GameLayoutPosition>,
  ): void;
}

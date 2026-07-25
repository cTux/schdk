import type { LocalizationCopy } from '../../../localization';
import type {
  CustomGameElement,
  GameLayoutElementId,
  GameLayoutPosition,
  GameOptions,
} from '../../../options/types';
import type { ElementSelection } from '../types';

export interface VisualEditorToolbarProps {
  copy: LocalizationCopy;
  game: GameOptions;
  labels: Record<GameLayoutElementId, string>;
  selected: ElementSelection | null;
  selectedCustom: CustomGameElement | null;
  selectedPosition: GameLayoutPosition | null;
  chooseImage(target: 'background' | string): void;
  onChange(game: GameOptions): void;
  removeCustom(id: string): void;
  updateCustom(id: string, patch: Partial<CustomGameElement>): void;
  updatePosition(
    selection: ElementSelection,
    patch: Partial<GameLayoutPosition>,
  ): void;
}

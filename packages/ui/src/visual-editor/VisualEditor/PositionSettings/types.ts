import type { LocalizationCopy } from '../../../localization';
import type { GameLayoutPosition } from '../../../options/types';
import type { ElementSelection } from '../types';

export interface PositionSettingsProps {
  copy: LocalizationCopy;
  position: GameLayoutPosition;
  selection: ElementSelection;
  onUpdate(
    selection: ElementSelection,
    patch: Partial<GameLayoutPosition>,
  ): void;
}

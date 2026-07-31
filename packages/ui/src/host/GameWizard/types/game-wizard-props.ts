import type { CustomGameElement, GameLayout } from '../../../options/types';
import { type LocalizationCopy } from '../../../localization';
import type { HostGameView } from '../../types';

export interface GameWizardProps {
  copy?: LocalizationCopy;
  customElements?: CustomGameElement[];
  game: HostGameView;
  layout: GameLayout | null;
  onBack(): void;
  onNext(): void;
}

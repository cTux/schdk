import { type GamePosition } from './game-flow';

export interface GameWizardSnapshot {
  finished: boolean;
  position: GamePosition;
}

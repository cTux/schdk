import { type GameLayout } from './game-layout';
import { type CustomGameElement } from './custom-game-element';

export interface GameOptions {
  autoFullscreen: boolean;
  soundVolume: number;
  musicVolume: number;
  layout: GameLayout | null;
  customElements: CustomGameElement[];
  backgroundImage: string | null;
  backgroundOpacity: number;
}

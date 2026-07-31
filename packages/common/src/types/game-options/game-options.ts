import { type GameLayout } from './game-layout.js';
import { type CustomGameElement } from './custom-game-element.js';

export interface GameOptions {
  autoFullscreen: boolean;
  soundVolume: number;
  musicVolume: number;
  layout: GameLayout | null;
  customElements: CustomGameElement[];
  backgroundImage: string | null;
  backgroundOpacity: number;
}

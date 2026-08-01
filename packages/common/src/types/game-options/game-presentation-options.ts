import type { GameOptions } from './game-options.js';

export type GamePresentationOptions = Pick<
  GameOptions,
  'layout' | 'customElements' | 'backgroundImage' | 'backgroundOpacity'
>;

import { DEFAULT_GAME_OPTIONS } from '../../constants/game-options/default-game-options.js';
import { type GameOptions } from '../../types/game-options/game-options.js';
import {
  isBackgroundImage,
  normalizeCustomElements,
} from './normalize-custom-elements.js';
import { normalizeGameLayout } from './normalize-game-layout.js';

function normalizeGameOptions(value: unknown): GameOptions | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<GameOptions>;
  const autoFullscreen = candidate.autoFullscreen ?? true;
  const musicVolume = candidate.musicVolume ?? DEFAULT_GAME_OPTIONS.musicVolume;
  if (
    typeof autoFullscreen !== 'boolean' ||
    !isVolume(candidate.soundVolume) ||
    !isVolume(musicVolume)
  ) {
    return null;
  }
  const layout = normalizeGameLayout(candidate.layout);
  if (candidate.layout !== undefined && candidate.layout !== null && !layout) {
    return null;
  }
  const backgroundImage = candidate.backgroundImage ?? null;
  const backgroundOpacity = candidate.backgroundOpacity ?? 1;
  const customElements = normalizeCustomElements(candidate.customElements);
  if (
    !customElements ||
    !isBackgroundImage(backgroundImage) ||
    !isVolume(backgroundOpacity)
  ) {
    return null;
  }
  return {
    autoFullscreen,
    soundVolume: candidate.soundVolume,
    musicVolume,
    layout,
    customElements,
    backgroundImage,
    backgroundOpacity,
  };
}

function isVolume(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

export { normalizeGameOptions };

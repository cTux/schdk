import { DEFAULT_GAME_OPTIONS, type GameOptions } from '@schdk/ui/options';
import { normalizeGameOptions } from './game-options-validation';
import { type OptionsStorage } from './options-storage-type';
import { GAME_OPTIONS_KEY } from './game-options-key';

export function loadGameOptions(storage: OptionsStorage): GameOptions {
  try {
    return (
      normalizeGameOptions(
        JSON.parse(storage.getItem(GAME_OPTIONS_KEY) ?? 'null'),
      ) ?? DEFAULT_GAME_OPTIONS
    );
  } catch {
    return DEFAULT_GAME_OPTIONS;
  }
}

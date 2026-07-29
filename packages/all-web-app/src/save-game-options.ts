import { type GameOptions } from '@schdk/ui/options';
import { type OptionsStorage } from './options-storage-type';
import { GAME_OPTIONS_KEY } from './game-options-key';

export function saveGameOptions(
  storage: OptionsStorage,
  options: GameOptions,
): boolean {
  try {
    storage.setItem(GAME_OPTIONS_KEY, JSON.stringify(options));
    return true;
  } catch {
    return false;
  }
}

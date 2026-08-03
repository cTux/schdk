import { type EditorTextOptions } from '@schdk/common/app-settings';
import { type OptionsStorage } from '../options/options-storage-type';
import { OPTIONS_KEY } from '../../constants/options/options-key';

export function saveEditorTextOptions(
  storage: OptionsStorage,
  options: EditorTextOptions,
) {
  try {
    storage.setItem(OPTIONS_KEY, JSON.stringify(options));
  } catch {
    // Preferences are optional and must not prevent the shell from loading.
  }
}

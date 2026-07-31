import {
  DEFAULT_EDITOR_TEXT_OPTIONS,
  type EditorTextOptions,
} from '@schdk/ui/options';
import { type OptionsStorage } from '../options/options-storage-type';
import { normalizeEditorTextOptions } from '../../utils/editor/normalize-editor-text-options';
import { OPTIONS_KEY } from '../../constants/options/options-key';
import { saveEditorTextOptions } from './save-editor-text-options';

function loadEditorTextOptions(storage: OptionsStorage): EditorTextOptions {
  try {
    return (
      normalizeEditorTextOptions(
        JSON.parse(storage.getItem(OPTIONS_KEY) ?? 'null'),
      ) ?? DEFAULT_EDITOR_TEXT_OPTIONS
    );
  } catch {
    return DEFAULT_EDITOR_TEXT_OPTIONS;
  }
}

export {
  loadEditorTextOptions,
  normalizeEditorTextOptions,
  saveEditorTextOptions,
};

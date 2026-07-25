import {
  DEFAULT_EDITOR_TEXT_OPTIONS,
  type EditorTextOptions,
} from '@schdk/ui/options';

const OPTIONS_KEY = 'schdk:editor-text-options';
type OptionsStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function loadEditorTextOptions(
  storage: OptionsStorage,
): EditorTextOptions {
  try {
    const value = JSON.parse(
      storage.getItem(OPTIONS_KEY) ?? 'null',
    ) as Partial<EditorTextOptions> | null;
    if (!value) return DEFAULT_EDITOR_TEXT_OPTIONS;
    return {
      correctQuestionText: value.correctQuestionText === true,
      correctAnswers: value.correctAnswers === true,
      correctAnswerComment: value.correctAnswerComment === true,
    };
  } catch {
    return DEFAULT_EDITOR_TEXT_OPTIONS;
  }
}

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

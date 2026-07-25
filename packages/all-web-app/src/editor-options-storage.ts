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
    return (
      normalizeEditorTextOptions(
        JSON.parse(storage.getItem(OPTIONS_KEY) ?? 'null'),
      ) ?? DEFAULT_EDITOR_TEXT_OPTIONS
    );
  } catch {
    return DEFAULT_EDITOR_TEXT_OPTIONS;
  }
}

export function normalizeEditorTextOptions(
  value: unknown,
): EditorTextOptions | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<EditorTextOptions>;
  if (
    typeof candidate.correctQuestionText !== 'boolean' ||
    typeof candidate.correctAnswers !== 'boolean' ||
    typeof candidate.correctAnswerComment !== 'boolean'
  ) {
    return null;
  }
  return {
    correctQuestionText: candidate.correctQuestionText,
    correctAnswers: candidate.correctAnswers,
    correctAnswerComment: candidate.correctAnswerComment,
  };
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

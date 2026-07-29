import { type EditorTextOptions } from '@schdk/ui/options';

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

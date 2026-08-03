import { type EditorTextOptions } from '@schdk/common/app-settings';

export function normalizeEditorTextOptions(
  value: unknown,
): EditorTextOptions | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<EditorTextOptions>;
  const hasValidCorrectionOptions =
    typeof candidate.correctQuestionText === 'boolean' &&
    typeof candidate.correctAnswers === 'boolean' &&
    typeof candidate.correctAnswerComment === 'boolean';
  if (!hasValidCorrectionOptions) return null;
  return {
    correctQuestionText: candidate.correctQuestionText as boolean,
    correctAnswers: candidate.correctAnswers as boolean,
    correctAnswerComment: candidate.correctAnswerComment as boolean,
  };
}

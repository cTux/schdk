import type { GameQuestion } from '@schdk/common';

export function getQuestionListItem(
  question: GameQuestion,
  showValidation: boolean,
) {
  const questionText = question.questionParts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' / ');
  const answer = question.answer.trim();
  const remark = question.comment?.trim() ?? '';
  const hasSummary =
    question.questionParts.every((part) => part.trim()) && Boolean(answer);
  const complete = hasSummary && !remark;

  return {
    answer,
    complete,
    hasPreview: hasSummary || Boolean(remark),
    hasSummary,
    invalid: showValidation && !complete,
    questionText,
    remark,
  };
}

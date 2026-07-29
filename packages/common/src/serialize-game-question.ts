import { type GameQuestion } from './game-question.js';

export function serializeGameQuestion(question: GameQuestion) {
  const handout =
    question.handout?.kind === 'text'
      ? {
          kind: 'text' as const,
          text: question.handout.text.trim(),
        }
      : question.handout;
  return {
    type: question.type,
    questionParts: question.questionParts.map((part) => part.trim()),
    answer: question.answer.trim(),
    ...(question.answerComment?.trim()
      ? { answerComment: question.answerComment.trim() }
      : {}),
    alternativeAnswers: question.alternativeAnswers
      .map((answer) => answer.trim())
      .filter(Boolean),
    wrongAnswers: question.wrongAnswers
      .map((answer) => answer.trim())
      .filter(Boolean),
    ...(handout && (handout.kind !== 'text' || handout.text)
      ? { handout }
      : {}),
    ...(question.comment?.trim() ? { comment: question.comment.trim() } : {}),
    ...(question.hostNotes?.trim()
      ? { hostNotes: question.hostNotes.trim() }
      : {}),
    ...(question.aiGeneration?.rule.trim()
      ? {
          aiGeneration: {
            ...question.aiGeneration,
            rule: question.aiGeneration.rule.trim(),
          },
        }
      : {}),
  };
}

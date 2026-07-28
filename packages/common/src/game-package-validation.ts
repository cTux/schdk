import {
  getGameQuestionAnswers,
  normalizeGameAnswer,
  type GameQuestion,
} from './game-question.js';

interface ValidatableGamePackage {
  title: string;
  questions: GameQuestion[];
}

export function validateGamePackageReadiness(
  gamePackage: ValidatableGamePackage,
  questionCount: number,
) {
  const errors: string[] = [];
  const answerOwners = new Map<string, number>();
  if (!gamePackage.title.trim()) errors.push('Вкажіть назву пакета.');
  if (gamePackage.questions.length !== questionCount) {
    errors.push(`Пакет має містити рівно ${questionCount} питань.`);
    return errors;
  }

  gamePackage.questions.forEach((question, index) => {
    const number = index + 1;
    question.questionParts.forEach((part, partIndex) => {
      if (!part.trim()) {
        const suffix =
          question.questionParts.length === 1
            ? ''
            : `, частина ${partIndex + 1}`;
        errors.push(`Питання ${number}${suffix}: немає тексту.`);
      }
    });
    if (!question.answer.trim())
      errors.push(`Питання ${number}: немає відповіді.`);
    const answers = new Set(
      getGameQuestionAnswers(question).map(normalizeGameAnswer),
    );
    const duplicate = [...answers].find((answer) => answerOwners.has(answer));
    if (duplicate) {
      errors.push(
        `Питання ${number}: відповідь повторює питання ${answerOwners.get(duplicate)}.`,
      );
    }
    answers.forEach((answer) => {
      if (!answerOwners.has(answer)) answerOwners.set(answer, number);
    });
    if (question.comment?.trim())
      errors.push(`Питання ${number}: є невирішений коментар.`);
  });
  return errors;
}

import type { GamePackage, GameQuestion } from '@schdk/common';

function updateGamePackageQuestion(
  gamePackage: GamePackage,
  index: number,
  change: Partial<GameQuestion>,
) {
  return {
    ...gamePackage,
    questions: gamePackage.questions.map((question, questionIndex) =>
      questionIndex === index ? { ...question, ...change } : question,
    ),
  };
}

function replaceGamePackageQuestion(
  gamePackage: GamePackage,
  index: number,
  question: GameQuestion,
) {
  return {
    ...gamePackage,
    questions: gamePackage.questions.map((current, questionIndex) =>
      questionIndex === index ? question : current,
    ),
  };
}

function isGameQuestionEmpty(question: GameQuestion) {
  return (
    question.questionParts.every((part) => !part.trim()) &&
    !question.answer.trim() &&
    question.alternativeAnswers.every((answer) => !answer.trim()) &&
    question.wrongAnswers.every((answer) => !answer.trim()) &&
    !question.answerComment?.trim() &&
    !question.comment?.trim() &&
    !question.hostNotes?.trim() &&
    !question.handout
  );
}

export {
  isGameQuestionEmpty,
  replaceGamePackageQuestion,
  updateGamePackageQuestion,
};

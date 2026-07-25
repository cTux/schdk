import {
  QUESTIONS_PER_ROUND,
  type GamePackage,
  type GameQuestion,
} from '@schdk/common';
import type { HostQuestionStage } from '@schdk/ui/host';

export interface GamePosition {
  questionIndex: number;
  questionPartIndex: number;
  stage: HostQuestionStage;
}

type QuestionPosition = Omit<GamePosition, 'questionIndex'>;

function getQuestionPositions(question: GameQuestion): QuestionPosition[] {
  const lastQuestionPartIndex = question.questionParts.length - 1;
  const positions: QuestionPosition[] = [
    { questionPartIndex: 0, stage: 'intro' },
    ...(question.handout
      ? [{ questionPartIndex: 0, stage: 'handout' } as const]
      : []),
  ];
  if (question.type === 'standard') {
    positions.push(
      { questionPartIndex: 0, stage: 'question' },
      { questionPartIndex: 0, stage: 'timer' },
    );
  } else {
    question.questionParts.forEach((_, questionPartIndex) => {
      positions.push({ questionPartIndex, stage: 'timer' });
    });
  }
  if (question.answerComment?.trim()) {
    positions.push({
      questionPartIndex: lastQuestionPartIndex,
      stage: 'answerComment',
    });
  }
  positions.push({ questionPartIndex: lastQuestionPartIndex, stage: 'answer' });
  return positions;
}

export function getQuestionStages(question: GameQuestion): HostQuestionStage[] {
  return getQuestionPositions(question).map(({ stage }) => stage);
}

export function getVisibleQuestionStages(
  question: GameQuestion,
  stage: HostQuestionStage,
): HostQuestionStage[] {
  if (stage === 'musicBreak') return [];
  if (stage === 'intro') return ['intro'];
  const stages: HostQuestionStage[] = [
    ...(question.handout ? (['handout'] as const) : []),
    'question',
    'timer',
    ...(question.answerComment?.trim() ? (['answerComment'] as const) : []),
    'answer',
  ];
  return stages.slice(0, stages.indexOf(stage) + 1);
}

export function isValidGamePosition(
  gamePackage: GamePackage,
  position: GamePosition,
) {
  if (position.stage === 'musicBreak') {
    return (
      position.questionPartIndex === 0 &&
      Boolean(getMusicBreak(gamePackage, position.questionIndex))
    );
  }
  const question = gamePackage.questions[position.questionIndex];
  if (!question) return false;
  return getQuestionPositions(question).some(
    ({ questionPartIndex, stage }) =>
      questionPartIndex === position.questionPartIndex &&
      stage === position.stage,
  );
}

function getMusicBreak(gamePackage: GamePackage, questionIndex: number) {
  const questionNumber = questionIndex + 1;
  if (
    questionNumber % QUESTIONS_PER_ROUND !== 0 ||
    questionNumber === gamePackage.questions.length
  ) {
    return null;
  }
  return gamePackage.musicBreaks[questionNumber / QUESTIONS_PER_ROUND - 1];
}

export function getNextPosition(
  gamePackage: GamePackage,
  position: GamePosition,
): GamePosition | null {
  if (position.stage === 'musicBreak') {
    return {
      questionIndex: position.questionIndex + 1,
      questionPartIndex: 0,
      stage: 'intro',
    };
  }
  const positions = getQuestionPositions(
    gamePackage.questions[position.questionIndex]!,
  );
  const positionIndex = positions.findIndex(
    ({ questionPartIndex, stage }) =>
      questionPartIndex === position.questionPartIndex &&
      stage === position.stage,
  );
  if (positionIndex < positions.length - 1) {
    return {
      questionIndex: position.questionIndex,
      ...positions[positionIndex + 1]!,
    };
  }
  if (getMusicBreak(gamePackage, position.questionIndex)) {
    return {
      questionIndex: position.questionIndex,
      questionPartIndex: 0,
      stage: 'musicBreak',
    };
  }
  return position.questionIndex < gamePackage.questions.length - 1
    ? {
        questionIndex: position.questionIndex + 1,
        questionPartIndex: 0,
        stage: 'intro',
      }
    : null;
}

export function getPreviousPosition(
  gamePackage: GamePackage,
  position: GamePosition,
): GamePosition | null {
  if (position.stage === 'musicBreak') {
    const positions = getQuestionPositions(
      gamePackage.questions[position.questionIndex]!,
    );
    return {
      questionIndex: position.questionIndex,
      ...positions[positions.length - 1]!,
    };
  }
  const positions = getQuestionPositions(
    gamePackage.questions[position.questionIndex]!,
  );
  const positionIndex = positions.findIndex(
    ({ questionPartIndex, stage }) =>
      questionPartIndex === position.questionPartIndex &&
      stage === position.stage,
  );
  if (positionIndex > 0) {
    return {
      questionIndex: position.questionIndex,
      ...positions[positionIndex - 1]!,
    };
  }
  if (position.questionIndex === 0) return null;
  const previousQuestionIndex = position.questionIndex - 1;
  if (getMusicBreak(gamePackage, previousQuestionIndex)) {
    return {
      questionIndex: previousQuestionIndex,
      questionPartIndex: 0,
      stage: 'musicBreak',
    };
  }
  const previousPositions = getQuestionPositions(
    gamePackage.questions[previousQuestionIndex]!,
  );
  return {
    questionIndex: previousQuestionIndex,
    ...previousPositions[previousPositions.length - 1]!,
  };
}

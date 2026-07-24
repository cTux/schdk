import type { GamePackage, GameQuestion } from '@schdk/common';
import type { HostQuestionStage } from '@schdk/ui/host';

export interface GamePosition {
  questionIndex: number;
  stage: HostQuestionStage;
}

export function getQuestionStages(question: GameQuestion): HostQuestionStage[] {
  return [
    'intro',
    ...(question.handout ? (['handout'] as const) : []),
    'question',
    'timer',
    ...(question.answerComment?.trim() ? (['answerComment'] as const) : []),
    'answer',
  ];
}

export function getVisibleQuestionStages(
  question: GameQuestion,
  stage: HostQuestionStage,
): HostQuestionStage[] {
  if (stage === 'intro') return ['intro'];
  const stages = getQuestionStages(question).filter(
    (questionStage) => questionStage !== 'intro',
  );
  return stages.slice(0, stages.indexOf(stage) + 1);
}

export function getNextPosition(
  gamePackage: GamePackage,
  position: GamePosition,
): GamePosition | null {
  const stages = getQuestionStages(
    gamePackage.questions[position.questionIndex]!,
  );
  const stageIndex = stages.indexOf(position.stage);
  if (stageIndex < stages.length - 1) {
    return {
      questionIndex: position.questionIndex,
      stage: stages[stageIndex + 1]!,
    };
  }
  return position.questionIndex < gamePackage.questions.length - 1
    ? { questionIndex: position.questionIndex + 1, stage: 'intro' }
    : null;
}

export function getPreviousPosition(
  gamePackage: GamePackage,
  position: GamePosition,
): GamePosition | null {
  const stages = getQuestionStages(
    gamePackage.questions[position.questionIndex]!,
  );
  const stageIndex = stages.indexOf(position.stage);
  if (stageIndex > 0) {
    return {
      questionIndex: position.questionIndex,
      stage: stages[stageIndex - 1]!,
    };
  }
  if (position.questionIndex === 0) return null;
  const previousQuestionIndex = position.questionIndex - 1;
  const previousStages = getQuestionStages(
    gamePackage.questions[previousQuestionIndex]!,
  );
  return {
    questionIndex: previousQuestionIndex,
    stage: previousStages[previousStages.length - 1]!,
  };
}

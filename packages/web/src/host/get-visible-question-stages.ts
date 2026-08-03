import type { GameQuestion } from '@schdk/common/game-question';
import type { HostQuestionStage } from '@schdk/common/game-hosting';

export function getVisibleQuestionStages(
  question: GameQuestion,
  stage: HostQuestionStage,
): HostQuestionStage[] {
  if (stage === 'tour' || stage === 'musicBreak') return [];
  if (stage === 'intro') return ['intro'];
  const stages: HostQuestionStage[] = [
    ...(question.handout ? (['handout'] as const) : []),
    'question',
    'timer',
    ...(question.answerComment?.trim() ? (['answerComment'] as const) : []),
    'answer',
  ];
  if (stage === 'timerReset') {
    return stages.slice(0, stages.indexOf('timer') + 1);
  }
  return stages.slice(0, stages.indexOf(stage) + 1);
}

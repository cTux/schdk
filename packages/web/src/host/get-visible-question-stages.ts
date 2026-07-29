import { type GameQuestion } from '@schdk/common';
import type { HostQuestionStage } from '@schdk/ui/host';

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
  return stages.slice(0, stages.indexOf(stage) + 1);
}

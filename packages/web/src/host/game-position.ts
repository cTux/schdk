import type { HostQuestionStage } from '@schdk/common/game-hosting';

export interface GamePosition {
  questionIndex: number;
  questionPartIndex: number;
  stage: HostQuestionStage;
}

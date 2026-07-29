import type { HostQuestionStage } from '@schdk/ui/host';

export interface GamePosition {
  questionIndex: number;
  questionPartIndex: number;
  stage: HostQuestionStage;
}

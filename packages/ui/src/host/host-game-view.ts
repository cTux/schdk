import { GameQuestion, MusicBreak } from '@schdk/common';

import { type HostQuestionStage } from './types';
import { type HostGameTransition } from './host-game-transition';

export interface HostGameView {
  question: GameQuestion;
  questionNumber: number;
  questionCount: number;
  currentQuestionPartIndex: number;
  currentStage: HostQuestionStage;
  visibleStages: HostQuestionStage[];
  remainingSeconds: number;
  transition: HostGameTransition;
  controlsDisabled: boolean;
  canGoBack: boolean;
  musicBreak: MusicBreak | null;
  musicVolume: number;
}

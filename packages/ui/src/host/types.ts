import type { GameQuestion } from '@schdk/common';
import type { MusicBreak } from '@schdk/common';

export type HostQuestionStage =
  | 'intro'
  | 'handout'
  | 'question'
  | 'timer'
  | 'answerComment'
  | 'answer'
  | 'musicBreak';

export interface HostGameTransition {
  phase: 'idle' | 'exit' | 'enter';
  direction: 'forward' | 'backward';
  questionChanging: boolean;
}

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

import type { GameQuestion } from '../game-questions/game-question.js';
import type { MusicBreak } from '../../types/music-breaks/music-break.js';

type HostQuestionStage =
  | 'tour'
  | 'intro'
  | 'handout'
  | 'question'
  | 'timer'
  | 'timerReset'
  | 'answerComment'
  | 'answer'
  | 'musicBreak';

interface HostGameTransition {
  phase: 'idle' | 'exit' | 'enter';
  direction: 'forward' | 'backward';
  questionChanging: boolean;
}

interface HostGameView {
  question: GameQuestion;
  questionNumber: number;
  questionCount: number;
  tourNumber: number;
  tourPhrase: string;
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

export { type HostGameTransition, type HostGameView, type HostQuestionStage };

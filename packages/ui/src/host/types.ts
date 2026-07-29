import { type HostGameTransition } from './host-game-transition';
import { type HostGameView } from './host-game-view';

type HostQuestionStage =
  | 'intro'
  | 'handout'
  | 'question'
  | 'timer'
  | 'answerComment'
  | 'answer'
  | 'musicBreak';

export { type HostQuestionStage, type HostGameTransition, type HostGameView };

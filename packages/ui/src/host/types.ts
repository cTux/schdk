import { type HostGameTransition } from './host-game-transition';
import { type HostGameView } from './host-game-view';

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

export { type HostQuestionStage, type HostGameTransition, type HostGameView };

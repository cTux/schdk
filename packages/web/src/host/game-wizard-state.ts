import type { HostGameTransition } from '@schdk/ui/host';
import type { GamePosition } from './game-flow';

interface GameWizardState {
  finished: boolean;
  position: GamePosition;
  remainingSeconds: number;
  transition: HostGameTransition;
}

type GameWizardAction =
  | { type: 'reset'; state: GameWizardState }
  | {
      type: 'exit';
      direction: HostGameTransition['direction'];
      questionChanging: boolean;
    }
  | {
      type: 'enter';
      direction: HostGameTransition['direction'];
      questionChanging: boolean;
      position: GamePosition | null;
      remainingSeconds?: number;
    }
  | { type: 'idle' }
  | { type: 'timer'; remainingSeconds: number };

function idleTransition(): HostGameTransition {
  return {
    phase: 'idle',
    direction: 'forward',
    questionChanging: false,
  };
}

function reduceGameWizard(
  state: GameWizardState,
  action: GameWizardAction,
): GameWizardState {
  switch (action.type) {
    case 'reset':
      return action.state;
    case 'exit':
      return {
        ...state,
        transition: {
          phase: 'exit',
          direction: action.direction,
          questionChanging: action.questionChanging,
        },
      };
    case 'enter':
      return {
        ...state,
        finished: !action.position,
        position: action.position ?? state.position,
        remainingSeconds: action.remainingSeconds ?? state.remainingSeconds,
        transition: {
          phase: 'enter',
          direction: action.direction,
          questionChanging: action.questionChanging,
        },
      };
    case 'idle':
      return { ...state, transition: idleTransition() };
    case 'timer':
      return { ...state, remainingSeconds: action.remainingSeconds };
  }
}

export { idleTransition, reduceGameWizard, type GameWizardState };

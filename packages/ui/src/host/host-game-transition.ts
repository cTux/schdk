export interface HostGameTransition {
  phase: 'idle' | 'exit' | 'enter';
  direction: 'forward' | 'backward';
  questionChanging: boolean;
}

import type { HostGameTransition, HostQuestionStage } from '../../types';

export function stageMotionClass(
  stage: HostQuestionStage,
  currentStage: HostQuestionStage,
  transition: HostGameTransition,
) {
  if (stage !== currentStage || transition.phase === 'idle') return '';
  if (transition.phase === 'enter') {
    return `is-entering is-${transition.direction}`;
  }
  if (transition.questionChanging) return '';
  return transition.direction === 'backward'
    ? 'is-exiting is-backward'
    : 'is-settling';
}

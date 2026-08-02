import { QUESTION_TYPE_CONFIG, type GamePackage } from '@schdk/common';
import type { HostQuestionStage } from '@schdk/ui/host';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { playMainSignal, playPreAlarm, stopGameAudio } from './game-audio';
import {
  getNextPosition,
  getPreviousPosition,
  getVisibleQuestionStages,
  isValidGamePosition,
  type GamePosition,
} from './game-flow';
import {
  getRemainingSeconds,
  getTimerSignal,
  QUESTION_TIME_SECONDS,
} from './game-timer';
import { type GameWizardSnapshot } from './game-wizard-snapshot';
import {
  idleTransition,
  reduceGameWizard,
  type GameWizardState,
} from './game-wizard-state';
import { prefersReducedMotion } from './prefers-reduced-motion';

const EXIT_DURATION_MS = 280;

const ENTER_DURATION_MS = 680;

const INITIAL_POSITION: GamePosition = {
  questionIndex: 0,
  questionPartIndex: 0,
  stage: 'tour',
};

type Direction = 'forward' | 'backward';

function useGameWizard(
  gamePackage: GamePackage | null,
  active: boolean,
  restoredState: GameWizardSnapshot | null = null,
) {
  const [state, dispatch] = useReducer(reduceGameWizard, {
    finished: false,
    position: INITIAL_POSITION,
    remainingSeconds: QUESTION_TIME_SECONDS,
    transition: idleTransition(),
  });
  const { finished, position, remainingSeconds, transition } = state;
  const transitionLocked = useRef(false);
  const transitionTimers = useRef<number[]>([]);
  const clearTransitionTimers = useCallback(() => {
    for (const timer of transitionTimers.current) window.clearTimeout(timer);
    transitionTimers.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    transitionTimers.current.push(timer);
  }, []);

  useEffect(() => {
    clearTransitionTimers();
    stopGameAudio();
    const hasValidRestoredPosition =
      restoredState &&
      gamePackage?.questions[restoredState.position.questionIndex] &&
      isValidGamePosition(gamePackage, restoredState.position);
    const restoredPosition = hasValidRestoredPosition
      ? restoredState.position
      : INITIAL_POSITION;
    const nextState: GameWizardState = {
      finished: restoredState?.finished ?? false,
      position: restoredPosition,
      remainingSeconds:
        restoredPosition.stage === 'timerReset'
          ? 0
          : gamePackage?.questions[restoredPosition.questionIndex]
            ? QUESTION_TYPE_CONFIG[
                gamePackage.questions[restoredPosition.questionIndex].type
              ].seconds
            : QUESTION_TIME_SECONDS,
      transition:
        active && !restoredState?.finished
          ? {
              phase: 'enter',
              direction: 'forward',
              questionChanging: true,
            }
          : idleTransition(),
    };
    dispatch({ type: 'reset', state: nextState });
    transitionLocked.current = active;
    if (!active || restoredState?.finished) {
      return;
    }
    schedule(
      () => {
        transitionLocked.current = false;
        dispatch({ type: 'idle' });
      },
      prefersReducedMotion() ? 0 : ENTER_DURATION_MS,
    );
    return clearTransitionTimers;
  }, [active, clearTransitionTimers, gamePackage, restoredState, schedule]);

  const move = useCallback(
    (direction: Direction) => {
      if (
        !active ||
        !gamePackage ||
        finished ||
        transitionLocked.current ||
        transition.phase !== 'idle'
      ) {
        return;
      }
      const target =
        direction === 'forward'
          ? getNextPosition(gamePackage, position)
          : getPreviousPosition(gamePackage, position);
      if (!target && direction === 'backward') return;

      transitionLocked.current = true;
      const questionChanging =
        !target ||
        target.questionIndex !== position.questionIndex ||
        target.stage === 'tour' ||
        position.stage === 'tour' ||
        target.stage === 'musicBreak' ||
        position.stage === 'musicBreak';
      dispatch({
        type: 'exit',
        direction,
        questionChanging,
      });
      schedule(
        () => {
          dispatch({
            type: 'enter',
            direction,
            questionChanging,
            position: target,
            remainingSeconds:
              target?.stage === 'timer'
                ? QUESTION_TYPE_CONFIG[
                    gamePackage.questions[target.questionIndex]!.type
                  ].seconds
                : target?.stage === 'timerReset'
                  ? 0
                  : undefined,
          });
          schedule(
            () => {
              transitionLocked.current = false;
              dispatch({ type: 'idle' });
            },
            prefersReducedMotion() ? 0 : ENTER_DURATION_MS,
          );
        },
        prefersReducedMotion() ? 0 : EXIT_DURATION_MS,
      );
    },
    [active, finished, gamePackage, position, schedule, transition.phase],
  );

  useEffect(() => {
    if (!active || finished) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.target instanceof HTMLMediaElement) return;
      const isForwardKey =
        event.code === 'Space' ||
        event.code === 'PageDown' ||
        event.code === 'ArrowRight';
      const isBackwardKey =
        event.code === 'Backspace' ||
        event.code === 'PageUp' ||
        event.code === 'ArrowLeft';
      if (isForwardKey) {
        event.preventDefault();
        move('forward');
      } else if (isBackwardKey) {
        event.preventDefault();
        move('backward');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, finished, move]);

  const question = gamePackage?.questions[position.questionIndex] ?? null;
  const questionTimeSeconds = question
    ? QUESTION_TYPE_CONFIG[question.type].seconds
    : QUESTION_TIME_SECONDS;
  const visibleStages = useMemo<HostQuestionStage[]>(
    () =>
      question ? getVisibleQuestionStages(question, position.stage) : ['tour'],
    [position.stage, question],
  );
  const timerRunning = active && !finished && position.stage === 'timer';

  useEffect(() => {
    if (!timerRunning) {
      dispatch({
        type: 'timer',
        remainingSeconds:
          position.stage === 'timerReset' ? 0 : questionTimeSeconds,
      });
      stopGameAudio();
      return;
    }

    const startedAt = Date.now();
    let previousSeconds: number = questionTimeSeconds;
    dispatch({ type: 'timer', remainingSeconds: previousSeconds });
    playMainSignal();
    const timer = window.setInterval(() => {
      const nextSeconds = getRemainingSeconds(
        startedAt,
        Date.now(),
        questionTimeSeconds,
      );
      if (nextSeconds === previousSeconds) return;
      const signal = getTimerSignal(previousSeconds, nextSeconds);
      if (signal === 'preAlarm') playPreAlarm();
      else if (signal === 'main') playMainSignal();
      previousSeconds = nextSeconds;
      dispatch({ type: 'timer', remainingSeconds: nextSeconds });
      if (nextSeconds === 0) window.clearInterval(timer);
    }, 100);

    return () => {
      window.clearInterval(timer);
      stopGameAudio();
    };
  }, [
    position.questionIndex,
    position.questionPartIndex,
    position.stage,
    questionTimeSeconds,
    timerRunning,
  ]);

  return {
    finished,
    position,
    question,
    remainingSeconds,
    transition,
    visibleStages,
    controlsDisabled: transition.phase !== 'idle',
    canGoBack: Boolean(
      gamePackage && getPreviousPosition(gamePackage, position),
    ),
    goBack: () => move('backward'),
    goNext: () => move('forward'),
  };
}

export { type GameWizardSnapshot, useGameWizard };

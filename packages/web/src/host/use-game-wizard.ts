import { QUESTION_TYPE_CONFIG, type GamePackage } from '@schdk/common';
import type { HostGameTransition, HostQuestionStage } from '@schdk/ui/host';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const EXIT_DURATION_MS = 280;

const ENTER_DURATION_MS = 680;

const INITIAL_POSITION: GamePosition = {
  questionIndex: 0,
  questionPartIndex: 0,
  stage: 'tour',
};

type Direction = 'forward' | 'backward';

function idleTransition(): HostGameTransition {
  return {
    phase: 'idle',
    direction: 'forward',
    questionChanging: false,
  };
}

function useGameWizard(
  gamePackage: GamePackage | null,
  active: boolean,
  restoredState: GameWizardSnapshot | null = null,
) {
  const [finished, setFinished] = useState(false);
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [remainingSeconds, setRemainingSeconds] = useState(
    QUESTION_TIME_SECONDS,
  );
  const [transition, setTransition] =
    useState<HostGameTransition>(idleTransition);
  const transitionLocked = useRef(false);
  const transitionTimers = useRef<number[]>([]);
  const reducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

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
    const restoredPosition =
      restoredState &&
      gamePackage?.questions[restoredState.position.questionIndex] &&
      isValidGamePosition(gamePackage, restoredState.position)
        ? restoredState.position
        : INITIAL_POSITION;
    setFinished(restoredState?.finished ?? false);
    setPosition(restoredPosition);
    setRemainingSeconds(
      gamePackage?.questions[restoredPosition.questionIndex]
        ? QUESTION_TYPE_CONFIG[
            gamePackage.questions[restoredPosition.questionIndex].type
          ].seconds
        : QUESTION_TIME_SECONDS,
    );
    transitionLocked.current = active;
    if (!active || restoredState?.finished) {
      setTransition(idleTransition());
      return;
    }
    setTransition({
      phase: 'enter',
      direction: 'forward',
      questionChanging: true,
    });
    schedule(
      () => {
        transitionLocked.current = false;
        setTransition(idleTransition());
      },
      reducedMotion.current ? 0 : ENTER_DURATION_MS,
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
      setTransition({
        phase: 'exit',
        direction,
        questionChanging,
      });
      schedule(
        () => {
          if (!target) {
            setFinished(true);
          } else {
            if (target.stage === 'timer') {
              setRemainingSeconds(
                QUESTION_TYPE_CONFIG[
                  gamePackage.questions[target.questionIndex]!.type
                ].seconds,
              );
            }
            setPosition(target);
          }
          setTransition({
            phase: 'enter',
            direction,
            questionChanging,
          });
          schedule(
            () => {
              transitionLocked.current = false;
              setTransition(idleTransition());
            },
            reducedMotion.current ? 0 : ENTER_DURATION_MS,
          );
        },
        reducedMotion.current ? 0 : EXIT_DURATION_MS,
      );
    },
    [active, finished, gamePackage, position, schedule, transition.phase],
  );

  useEffect(() => {
    if (!active || finished) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.target instanceof HTMLMediaElement) return;
      if (
        event.code === 'Space' ||
        event.code === 'PageDown' ||
        event.code === 'ArrowRight'
      ) {
        event.preventDefault();
        move('forward');
      } else if (
        event.code === 'Backspace' ||
        event.code === 'PageUp' ||
        event.code === 'ArrowLeft'
      ) {
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
  const timerVisible = active && !finished && visibleStages.includes('timer');

  useEffect(() => {
    if (!timerVisible) {
      setRemainingSeconds(questionTimeSeconds);
      stopGameAudio();
      return;
    }

    const startedAt = Date.now();
    let previousSeconds: number = questionTimeSeconds;
    setRemainingSeconds(previousSeconds);
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
      setRemainingSeconds(nextSeconds);
      if (nextSeconds === 0) window.clearInterval(timer);
    }, 100);

    return () => {
      window.clearInterval(timer);
      stopGameAudio();
    };
  }, [
    position.questionIndex,
    position.questionPartIndex,
    questionTimeSeconds,
    timerVisible,
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

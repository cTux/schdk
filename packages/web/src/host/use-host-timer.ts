import { QUESTION_TYPE_CONFIG, type GameQuestion } from '@schdk/common';
import { useEffect, type Dispatch } from 'react';
import {
  getRemainingSeconds,
  getTimerDisplaySeconds,
  getTimerSignal,
} from './game-timer';
import { playMainSignal, playPreAlarm, stopGameAudio } from './game-audio';
import type { GamePosition } from './game-position';
import type { GameWizardAction } from './game-wizard-state';

interface HostTimerOptions {
  active: boolean;
  dispatch: Dispatch<GameWizardAction>;
  finished: boolean;
  position: GamePosition;
  question: GameQuestion | null;
}

export function useHostTimer({
  active,
  dispatch,
  finished,
  position,
  question,
}: HostTimerOptions) {
  const timerConfig = question
    ? QUESTION_TYPE_CONFIG[question.type]
    : QUESTION_TYPE_CONFIG.standard;
  const questionTimeSeconds = timerConfig.seconds;
  const submissionTimeSeconds = timerConfig.submissionSeconds;
  const timerDurationSeconds = questionTimeSeconds + submissionTimeSeconds;
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
    let previousSeconds: number = timerDurationSeconds;
    dispatch({
      type: 'timer',
      remainingSeconds: getTimerDisplaySeconds(
        previousSeconds,
        submissionTimeSeconds,
      ),
    });
    playMainSignal();
    const timer = window.setInterval(() => {
      const nextSeconds = getRemainingSeconds(
        startedAt,
        Date.now(),
        timerDurationSeconds,
      );
      if (nextSeconds === previousSeconds) return;
      const signal = getTimerSignal(previousSeconds, nextSeconds);
      if (signal === 'preAlarm') playPreAlarm();
      else if (signal === 'main') playMainSignal();
      previousSeconds = nextSeconds;
      dispatch({
        type: 'timer',
        remainingSeconds: getTimerDisplaySeconds(
          nextSeconds,
          submissionTimeSeconds,
        ),
      });
      if (nextSeconds === 0) window.clearInterval(timer);
    }, 100);

    return () => {
      window.clearInterval(timer);
      stopGameAudio();
    };
  }, [
    dispatch,
    position.questionIndex,
    position.questionPartIndex,
    position.stage,
    questionTimeSeconds,
    submissionTimeSeconds,
    timerDurationSeconds,
    timerRunning,
  ]);
}

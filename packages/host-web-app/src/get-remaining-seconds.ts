import { QUESTION_TIME_SECONDS } from './game-timer';

export function getRemainingSeconds(
  startedAt: number,
  now: number,
  durationSeconds = QUESTION_TIME_SECONDS,
): number {
  return Math.max(
    0,
    Math.ceil((startedAt + durationSeconds * 1000 - now) / 1000),
  );
}

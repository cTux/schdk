export const QUESTION_TIME_SECONDS = 60;

export type TimerSignal = 'main' | 'preAlarm' | null;

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

export function getTimerSignal(
  previousSeconds: number,
  remainingSeconds: number,
): TimerSignal {
  if (remainingSeconds === 0 && previousSeconds > 0) return 'main';
  if (remainingSeconds <= 10 && previousSeconds > 10) return 'preAlarm';
  return null;
}

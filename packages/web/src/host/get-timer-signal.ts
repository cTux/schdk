import { type TimerSignal } from './timer-signal';

export function getTimerSignal(
  previousSeconds: number,
  remainingSeconds: number,
): TimerSignal {
  if (remainingSeconds === 0 && previousSeconds > 0) return 'main';
  if (remainingSeconds <= 10 && previousSeconds > 10) return 'preAlarm';
  return null;
}

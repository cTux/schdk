type TimerSignal = 'main' | 'preAlarm' | null;

export function getTimerSignal(
  previousSeconds: number,
  remainingSeconds: number,
): TimerSignal {
  if (remainingSeconds === 0 && previousSeconds > 0) return 'main';
  if (remainingSeconds <= 10 && previousSeconds > 10) return 'preAlarm';
  return null;
}

export type { TimerSignal };

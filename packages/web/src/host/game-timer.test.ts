import { describe, expect, it } from 'vitest';
import {
  getRemainingSeconds,
  getTimerDisplaySeconds,
  getTimerSignal,
  QUESTION_TIME_SECONDS,
} from './game-timer';

describe('question timer', () => {
  it('counts down one minute plus submission time against wall-clock time', () => {
    const durationSeconds = QUESTION_TIME_SECONDS + 10;
    expect(getRemainingSeconds(1_000, 1_000, durationSeconds)).toBe(70);
    expect(getRemainingSeconds(1_000, 61_000, durationSeconds)).toBe(10);
    expect(getRemainingSeconds(1_000, 71_000, durationSeconds)).toBe(0);
  });

  it('shows the minute before switching to submission time', () => {
    expect(getTimerDisplaySeconds(70, 10)).toBe(60);
    expect(getTimerDisplaySeconds(11, 10)).toBe(1);
    expect(getTimerDisplaySeconds(10, 10)).toBe(10);
    expect(getTimerDisplaySeconds(0, 10)).toBe(0);
  });

  it('emits the ten-second and expiry signals once per threshold', () => {
    expect(getTimerSignal(11, 10)).toBe('preAlarm');
    expect(getTimerSignal(10, 9)).toBeNull();
    expect(getTimerSignal(1, 0)).toBe('main');
    expect(getTimerSignal(0, 0)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import {
  getRemainingSeconds,
  getTimerSignal,
  QUESTION_TIME_SECONDS,
} from './game-timer';

describe('question timer', () => {
  it('counts down one minute plus submission time against wall-clock time', () => {
    expect(getRemainingSeconds(1_000, 1_000)).toBe(QUESTION_TIME_SECONDS);
    expect(getRemainingSeconds(1_000, 61_001)).toBe(10);
    expect(getRemainingSeconds(1_000, 71_000)).toBe(0);
  });

  it('emits the ten-second and expiry signals once per threshold', () => {
    expect(getTimerSignal(11, 10)).toBe('preAlarm');
    expect(getTimerSignal(10, 9)).toBeNull();
    expect(getTimerSignal(1, 0)).toBe('main');
    expect(getTimerSignal(0, 0)).toBeNull();
  });
});

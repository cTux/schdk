import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AUTOSAVE_DELAY_MS,
  saveStatusAfterWrite,
  scheduleAutosave,
  shouldScheduleAutosave,
} from './autosave';

describe('scheduleAutosave', () => {
  afterEach(() => vi.useRealTimers());

  it('saves only after three quiet seconds', () => {
    vi.useFakeTimers();
    const save = vi.fn();
    const cancel = scheduleAutosave(save);

    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS - 1);
    expect(save).not.toHaveBeenCalled();
    cancel();

    scheduleAutosave(save);
    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS - 1);
    expect(save).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledOnce();
  });

  it('keeps newer edits pending after an older save finishes', () => {
    expect(saveStatusAfterWrite(false)).toBe('pending');
    expect(saveStatusAfterWrite(true)).toBe('saved');
  });

  it('schedules every writable pending change', () => {
    expect(shouldScheduleAutosave('pending', true)).toBe(true);
    expect(shouldScheduleAutosave('saved', true)).toBe(false);
    expect(shouldScheduleAutosave('pending', false)).toBe(false);
  });
});

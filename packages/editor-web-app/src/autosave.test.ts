import { afterEach, describe, expect, it, vi } from 'vitest';
import { AUTOSAVE_DELAY_MS, scheduleAutosave } from './autosave';

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
});

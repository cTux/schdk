import { scheduleAutosave } from './schedule-autosave';
import { saveStatusAfterWrite } from './save-status-after-write';
import { shouldScheduleAutosave } from './should-schedule-autosave';

const AUTOSAVE_DELAY_MS = 1_000;

export {
  AUTOSAVE_DELAY_MS,
  scheduleAutosave,
  saveStatusAfterWrite,
  shouldScheduleAutosave,
};

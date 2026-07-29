import type { BrowserWindow } from 'electron';
import type { PresenterNotes } from './presenter-notes-data.js';

export const presenterNotesState: {
  notes: PresenterNotes | null;
  dismissed: boolean;
  window: BrowserWindow | null;
} = {
  notes: null,
  dismissed: false,
  window: null,
};

import { presenterNotesState } from './presenter-notes-state.js';
import { registerPresenterNotesIpc } from './register-presenter-notes-ipc.js';

function closePresenterNotes() {
  presenterNotesState.notes = null;
  presenterNotesState.dismissed = false;
  const window = presenterNotesState.window;
  presenterNotesState.window = null;
  if (window && !window.isDestroyed()) window.destroy();
}

export { closePresenterNotes, registerPresenterNotesIpc };

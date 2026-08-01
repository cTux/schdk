import { type SessionStorage } from './session-storage';
import { type DesktopEditorSession } from './desktop-editor-session';
import { sessionKey } from './session-key';

export function saveDesktopEditorSession(
  storage: SessionStorage,
  scope: string,
  session: DesktopEditorSession | null,
) {
  try {
    if (session) storage.setItem(sessionKey(scope), JSON.stringify(session));
    else storage.removeItem(sessionKey(scope));
  } catch {
    // Session restoration is best-effort.
  }
}

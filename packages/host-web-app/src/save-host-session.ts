import { type SessionStorage } from './session-storage';
import { type HostSession } from './host-session';
import { SESSION_KEY_PREFIX } from './session-key-prefix';

export function saveHostSession(
  storage: SessionStorage,
  scope: string,
  session: HostSession | null,
) {
  try {
    if (session) {
      storage.setItem(`${SESSION_KEY_PREFIX}${scope}`, JSON.stringify(session));
    } else {
      storage.removeItem(`${SESSION_KEY_PREFIX}${scope}`);
    }
  } catch {
    // Session restoration is best-effort.
  }
}

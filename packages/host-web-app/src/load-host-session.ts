import { type SessionStorage } from './session-storage';
import { type HostSession } from './host-session';
import { parseHostSession } from './parse-host-session';
import { SESSION_KEY_PREFIX } from './session-key-prefix';

export function loadHostSession(
  storage: SessionStorage,
  scope: string,
): HostSession | null {
  try {
    return parseHostSession(
      JSON.parse(storage.getItem(`${SESSION_KEY_PREFIX}${scope}`) ?? 'null'),
    );
  } catch {
    return null;
  }
}

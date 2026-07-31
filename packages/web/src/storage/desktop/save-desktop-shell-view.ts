import type { ShellViewName } from '@schdk/ui/shell';
import { type SessionStorage } from '../shell/session-storage';
import { SESSION_KEY_PREFIX } from '../../constants/shell/session-key-prefix';

export function saveDesktopShellView(
  storage: SessionStorage,
  scope: string,
  view: ShellViewName,
) {
  try {
    storage.setItem(`${SESSION_KEY_PREFIX}${scope}`, view);
  } catch {
    // Session restoration is best-effort.
  }
}

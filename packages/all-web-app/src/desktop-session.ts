import type { ShellViewName } from '@schdk/ui/shell';
import { type SessionStorage } from './session-storage';
import { SESSION_KEY_PREFIX } from './session-key-prefix';
import { isShellViewName } from './is-shell-view-name';
import { saveDesktopShellView } from './save-desktop-shell-view';
import { getDeepLinkedShellView } from './get-deep-linked-shell-view';
import { getDeepLinkedShellEdit } from './get-deep-linked-shell-edit';
import { getShellDeepLink } from './get-shell-deep-link';
import { getShellEditDeepLink } from './get-shell-edit-deep-link';

function loadDesktopShellView(
  storage: SessionStorage,
  scope: string,
): ShellViewName | null {
  try {
    const view = storage.getItem(`${SESSION_KEY_PREFIX}${scope}`);
    return isShellViewName(view) ? view : null;
  } catch {
    return null;
  }
}

export {
  loadDesktopShellView,
  saveDesktopShellView,
  getDeepLinkedShellView,
  getDeepLinkedShellEdit,
  getShellDeepLink,
  getShellEditDeepLink,
};

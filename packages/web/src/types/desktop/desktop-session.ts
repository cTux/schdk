import type { ShellViewName } from '@schdk/ui/shell';
import { type SessionStorage } from '../../storage/shell/session-storage';
import { SESSION_KEY_PREFIX } from '../../constants/shell/session-key-prefix';
import { isShellViewName } from '../../utils/shell/is-shell-view-name';
import { saveDesktopShellView } from '../../storage/desktop/save-desktop-shell-view';
import { getDeepLinkedShellView } from '../../utils/shell/get-deep-linked-shell-view';
import { getDeepLinkedShellEdit } from '../../utils/shell/get-deep-linked-shell-edit';
import { getShellDeepLink } from '../../utils/shell/get-shell-deep-link';
import { getShellEditDeepLink } from '../../utils/shell/get-shell-edit-deep-link';

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

import type { ShellViewName } from '@schdk/ui/shell';

const SESSION_KEY_PREFIX = 'schdk.desktop.shell-view:';

type SessionStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function loadDesktopShellView(
  storage: SessionStorage,
  scope: string,
): ShellViewName | null {
  try {
    const view = storage.getItem(`${SESSION_KEY_PREFIX}${scope}`);
    return view === 'home' ||
      view === 'host' ||
      view === 'editor' ||
      view === 'visualEditor' ||
      view === 'options'
      ? view
      : null;
  } catch {
    return null;
  }
}

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

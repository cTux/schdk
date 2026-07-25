import type { ShellViewName } from '@schdk/ui/shell';

const SESSION_KEY_PREFIX = 'schdk.desktop.shell-view:';
const VIEW_PARAMETER = 'view';

type SessionStorage = Pick<Storage, 'getItem' | 'setItem'>;

function isShellViewName(value: string | null): value is ShellViewName {
  return (
    value === 'home' ||
    value === 'host' ||
    value === 'editor' ||
    value === 'visualEditor' ||
    value === 'options'
  );
}

export function loadDesktopShellView(
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

export function getDeepLinkedShellView(url: string): ShellViewName | null {
  try {
    const view = new URL(url).searchParams.get(VIEW_PARAMETER);
    return isShellViewName(view) ? view : null;
  } catch {
    return null;
  }
}

export function getShellDeepLink(url: string, view: ShellViewName) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set(VIEW_PARAMETER, view);
  return nextUrl.href;
}

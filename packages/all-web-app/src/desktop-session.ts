import type { ShellEditTarget, ShellViewName } from '@schdk/ui/shell';

const SESSION_KEY_PREFIX = 'schdk.desktop.shell-view:';
const EDIT_PARAMETER = 'edit';
const VIEW_PARAMETER = 'view';

type SessionStorage = Pick<Storage, 'getItem' | 'setItem'>;

function isShellViewName(value: string | null): value is ShellViewName {
  return (
    value === 'home' ||
    value === 'host' ||
    value === 'editor' ||
    value === 'visualEditor' ||
    value === 'artificialIntelligence' ||
    value === 'packageRules' ||
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

export function getDeepLinkedShellEdit(url: string): ShellEditTarget | null {
  try {
    const value = new URL(url).searchParams.get(EDIT_PARAMETER);
    const question = value?.match(/^question:(account|global):(.+)$/);
    if (question) {
      return {
        kind: 'question',
        global: question[1] === 'global',
        name: question[2]!,
      };
    }
    return value?.startsWith('package:') && value.length > 'package:'.length
      ? { kind: 'package', name: value.slice('package:'.length) }
      : null;
  } catch {
    return null;
  }
}

export function getShellDeepLink(url: string, view: ShellViewName) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set(VIEW_PARAMETER, view);
  return nextUrl.href;
}

export function getShellEditDeepLink(
  url: string,
  target: ShellEditTarget | null,
) {
  const nextUrl = new URL(url);
  if (!target) nextUrl.searchParams.delete(EDIT_PARAMETER);
  else {
    nextUrl.searchParams.set(
      EDIT_PARAMETER,
      target.kind === 'package'
        ? `package:${target.name}`
        : `question:${target.global ? 'global' : 'account'}:${target.name}`,
    );
  }
  return nextUrl.href;
}

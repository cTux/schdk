import { QUESTION_COUNT } from '@schdk/common';

const SESSION_KEY_PREFIX = 'schdk.desktop.editor-session:';

type SessionStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

export interface DesktopEditorSession {
  filePath: string;
  selectedIndex: number;
}

function sessionKey(scope: string) {
  return `${SESSION_KEY_PREFIX}${scope}`;
}

export function loadDesktopEditorSession(
  storage: SessionStorage,
  scope: string,
): DesktopEditorSession | null {
  try {
    const value: unknown = JSON.parse(
      storage.getItem(sessionKey(scope)) ?? 'null',
    );
    if (
      !value ||
      typeof value !== 'object' ||
      !('filePath' in value) ||
      typeof value.filePath !== 'string' ||
      !/\.schdk$/iu.test(value.filePath) ||
      !('selectedIndex' in value) ||
      typeof value.selectedIndex !== 'number' ||
      !Number.isSafeInteger(value.selectedIndex) ||
      value.selectedIndex < 0 ||
      value.selectedIndex >= QUESTION_COUNT
    ) {
      return null;
    }
    return {
      filePath: value.filePath,
      selectedIndex: value.selectedIndex,
    };
  } catch {
    return null;
  }
}

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

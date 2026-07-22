import { QUESTION_COUNT } from '@schdk/common';

const SESSION_KEY_PREFIX = 'schdk.desktop.editor-session:';
const RECENT_TITLES_KEY_PREFIX = 'schdk.desktop.recent-titles:';

type SessionStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

export interface DesktopEditorSession {
  filePath: string;
  selectedIndex: number;
}

function sessionKey(scope: string) {
  return `${SESSION_KEY_PREFIX}${scope}`;
}

function recentTitlesKey(scope: string) {
  return `${RECENT_TITLES_KEY_PREFIX}${scope}`;
}

export function loadDesktopRecentTitles(
  storage: SessionStorage,
  scope: string,
): Record<string, string> {
  try {
    const value: unknown = JSON.parse(
      storage.getItem(recentTitlesKey(scope)) ?? 'null',
    );
    if (!value || typeof value !== 'object') return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        ([filePath, title]) =>
          /\.schdk$/iu.test(filePath) && typeof title === 'string',
      ),
    );
  } catch {
    return {};
  }
}

export function saveDesktopRecentTitle(
  storage: SessionStorage,
  scope: string,
  filePath: string,
  title: string,
) {
  try {
    storage.setItem(
      recentTitlesKey(scope),
      JSON.stringify({
        ...loadDesktopRecentTitles(storage, scope),
        [filePath]: title,
      }),
    );
  } catch {
    // Recent title metadata is best-effort.
  }
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

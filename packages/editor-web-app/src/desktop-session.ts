import { QUESTION_COUNT } from '@schdk/common';

const SESSION_KEY_PREFIX = 'schdk.desktop.editor-session:';
const RECENT_METADATA_KEY_PREFIX = 'schdk.desktop.recent-titles:';

type SessionStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

export interface DesktopEditorSession {
  filePath: string;
  selectedIndex: number;
}

function sessionKey(scope: string) {
  return `${SESSION_KEY_PREFIX}${scope}`;
}

export interface DesktopRecentMetadata {
  title: string;
  ready?: boolean;
}

function recentMetadataKey(scope: string) {
  return `${RECENT_METADATA_KEY_PREFIX}${scope}`;
}

export function loadDesktopRecentMetadata(
  storage: SessionStorage,
  scope: string,
): Record<string, DesktopRecentMetadata> {
  try {
    const value: unknown = JSON.parse(
      storage.getItem(recentMetadataKey(scope)) ?? 'null',
    );
    if (!value || typeof value !== 'object') return {};
    return Object.fromEntries(
      Object.entries(value).flatMap(([filePath, metadata]) => {
        if (!/\.schdk$/iu.test(filePath)) return [];
        if (typeof metadata === 'string')
          return [[filePath, { title: metadata }]];
        if (
          !metadata ||
          typeof metadata !== 'object' ||
          !('title' in metadata) ||
          typeof metadata.title !== 'string'
        )
          return [];
        return [
          [
            filePath,
            {
              title: metadata.title,
              ...('ready' in metadata && typeof metadata.ready === 'boolean'
                ? { ready: metadata.ready }
                : {}),
            },
          ],
        ];
      }),
    );
  } catch {
    return {};
  }
}

export function saveDesktopRecentMetadata(
  storage: SessionStorage,
  scope: string,
  filePath: string,
  metadata: DesktopRecentMetadata,
) {
  try {
    storage.setItem(
      recentMetadataKey(scope),
      JSON.stringify({
        ...loadDesktopRecentMetadata(storage, scope),
        [filePath]: metadata,
      }),
    );
  } catch {
    // Recent package metadata is best-effort.
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

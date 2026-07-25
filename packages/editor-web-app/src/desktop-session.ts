import { QUESTION_COUNT } from '@schdk/common';
import { isDriveFileId, isDriveGamePackageName } from '@schdk/google-drive';

const SESSION_KEY_PREFIX = 'schdk.desktop.editor-session:';

type SessionStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

export interface DesktopEditorSession {
  driveFileId: string;
  fileName: string;
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
      !('driveFileId' in value) ||
      !isDriveFileId(value.driveFileId) ||
      !('fileName' in value) ||
      !isDriveGamePackageName(value.fileName) ||
      !('selectedIndex' in value) ||
      typeof value.selectedIndex !== 'number' ||
      !Number.isSafeInteger(value.selectedIndex) ||
      value.selectedIndex < 0 ||
      value.selectedIndex >= QUESTION_COUNT
    ) {
      return null;
    }
    return {
      driveFileId: value.driveFileId,
      fileName: value.fileName,
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

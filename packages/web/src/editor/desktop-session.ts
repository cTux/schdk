import { QUESTION_COUNT } from '@schdk/common';
import { isDriveFileId, isDriveGamePackageName } from '@schdk/google-drive';
import { type SessionStorage } from './session-storage';
import { type DesktopEditorSession } from './desktop-editor-session';
import { sessionKey } from './session-key';
import { saveDesktopEditorSession } from './save-desktop-editor-session';

function loadDesktopEditorSession(
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

export {
  type DesktopEditorSession,
  loadDesktopEditorSession,
  saveDesktopEditorSession,
};

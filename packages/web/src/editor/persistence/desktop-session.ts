import { QUESTION_COUNT } from '@schdk/common';
import { isDriveFileId } from '@schdk/google-drive';
import { isDriveGamePackageName } from '@schdk/google-drive/game-packages';
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
    const isObject = !!value && typeof value === 'object';
    if (!isObject) return null;
    const hasValidPackageIdentity =
      'driveFileId' in value &&
      isDriveFileId(value.driveFileId) &&
      'fileName' in value &&
      isDriveGamePackageName(value.fileName);
    const hasValidSelectedIndex =
      'selectedIndex' in value &&
      typeof value.selectedIndex === 'number' &&
      Number.isSafeInteger(value.selectedIndex) &&
      value.selectedIndex >= 0 &&
      value.selectedIndex < QUESTION_COUNT;
    if (!hasValidPackageIdentity || !hasValidSelectedIndex) {
      return null;
    }
    return {
      driveFileId: value.driveFileId as string,
      fileName: value.fileName as string,
      selectedIndex: value.selectedIndex as number,
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

import {
  hasGamePackageRemarks,
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  createGamePackageFilename,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import { showEditorToast, type EditorSaveStatus } from '@schdk/ui/editor';
import type { AppLocale, LocalizationCopy } from '@schdk/ui/localization';
import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import {
  saveStatusAfterWrite,
  scheduleAutosave,
  shouldScheduleAutosave,
} from './autosave';
import {
  useDesktopEditorSession,
  useEditorCloseGuard,
  useEditorDocumentTitle,
} from './use-editor-lifecycle';

interface EditorPersistenceOptions {
  copy: LocalizationCopy;
  desktopSessionReady: boolean;
  drive?: DrivePackageStorage;
  driveActive: boolean;
  driveFileId: string | null;
  driveModifiedTime: string | null;
  fileName: string | null;
  gamePackage: GamePackage;
  hasPackage: boolean;
  locale: AppLocale;
  manageDocumentTitle: boolean;
  saveQueue: MutableRefObject<Promise<void>>;
  saveStatus: EditorSaveStatus;
  sessionScope: string;
  selectedIndex: number;
  currentPackage: MutableRefObject<GamePackage>;
  onDriveFailure?(): void;
  resolveDriveConflict(gamePackage: GamePackage): Promise<boolean>;
  setFileName: Dispatch<SetStateAction<string | null>>;
  setDriveModifiedTime: Dispatch<SetStateAction<string | null>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setSaveStatus: Dispatch<SetStateAction<EditorSaveStatus>>;
}

export function useEditorPersistence({
  copy,
  desktopSessionReady,
  drive,
  driveActive,
  driveFileId,
  driveModifiedTime,
  fileName,
  gamePackage,
  hasPackage,
  locale,
  manageDocumentTitle,
  saveQueue,
  saveStatus,
  sessionScope,
  selectedIndex,
  currentPackage,
  onDriveFailure,
  resolveDriveConflict,
  setFileName,
  setDriveModifiedTime,
  setMessage,
  setSaveStatus,
}: EditorPersistenceOptions) {
  const previousDriveActive = useRef(driveActive);
  const saveCurrentPackage = useCallback(async () => {
    if (!drive || !driveFileId || !driveModifiedTime || !fileName) {
      throw new Error('Google Drive is unavailable');
    }
    const content = serializeGamePackage(gamePackage);
    setSaveStatus('saving');
    const save = saveQueue.current
      .catch(() => undefined)
      .then(() =>
        drive.updateGamePackage(driveFileId, driveModifiedTime, {
          name: createGamePackageFilename(
            gamePackage.title,
            copy.editor.unfinishedGame,
          ),
          title: gamePackage.title,
          content,
          ready: validateGamePackage(gamePackage).length === 0,
          hasRemarks: hasGamePackageRemarks(gamePackage),
        }),
      );
    saveQueue.current = save.then(() => undefined);
    try {
      const saved = await save;
      if (!saved) {
        if (await resolveDriveConflict(gamePackage)) return true;
        setSaveStatus('error');
        return false;
      }
      setDriveModifiedTime(saved.modifiedTime);
      setFileName(saved.name);
      const nextSaveStatus = saveStatusAfterWrite(
        gamePackage === currentPackage.current,
      );
      setSaveStatus(nextSaveStatus);
      if (nextSaveStatus === 'saved') showEditorToast('saved', locale);
      return true;
    } catch (error) {
      setSaveStatus('error');
      onDriveFailure?.();
      throw error;
    }
  }, [
    copy.editor.unfinishedGame,
    currentPackage,
    drive,
    driveFileId,
    driveModifiedTime,
    fileName,
    gamePackage,
    locale,
    onDriveFailure,
    resolveDriveConflict,
    saveQueue,
    setFileName,
    setDriveModifiedTime,
    setSaveStatus,
  ]);

  useDesktopEditorSession({
    ready: desktopSessionReady,
    driveFileId,
    fileName,
    selectedIndex,
    sessionScope,
  });
  useEditorCloseGuard({
    copy,
    hasPackage,
    saveStatus,
    saveCurrentPackage,
    setMessage,
  });
  useEditorDocumentTitle({
    copy,
    enabled: manageDocumentTitle,
    fileName,
    locale,
  });

  useEffect(() => {
    if (
      driveActive &&
      !previousDriveActive.current &&
      driveFileId &&
      saveStatus === 'error'
    ) {
      setSaveStatus('pending');
    }
    previousDriveActive.current = driveActive;
  }, [driveActive, driveFileId, saveStatus, setSaveStatus]);

  useEffect(() => {
    if (!shouldScheduleAutosave(saveStatus, Boolean(driveFileId && drive))) {
      return;
    }
    return scheduleAutosave(async () => {
      try {
        await saveCurrentPackage();
      } catch {
        setMessage(copy.editor.autoSaveFailed);
      }
    });
  }, [copy, drive, driveFileId, saveCurrentPackage, saveStatus, setMessage]);

  return saveCurrentPackage;
}

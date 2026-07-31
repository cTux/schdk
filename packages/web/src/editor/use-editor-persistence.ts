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
import { saveDesktopEditorSession } from './desktop-session';

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
  useEffect(() => {
    if (!window.desktop || !desktopSessionReady) return;
    saveDesktopEditorSession(
      localStorage,
      sessionScope,
      driveFileId && fileName ? { driveFileId, fileName, selectedIndex } : null,
    );
  }, [desktopSessionReady, driveFileId, fileName, selectedIndex, sessionScope]);

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

  useEffect(() => {
    window.desktop?.setEditorPackageOpen(hasPackage);
    return () => window.desktop?.setEditorPackageOpen(false);
  }, [hasPackage]);

  useEffect(() => {
    if (window.desktop || !hasPackage || saveStatus === 'saved') return;
    const preventUnsavedClose = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', preventUnsavedClose);
    return () =>
      window.removeEventListener('beforeunload', preventUnsavedClose);
  }, [hasPackage, saveStatus]);

  useEffect(
    () =>
      window.desktop?.onCloseRequested(async (attempt) => {
        if (saveStatus === 'saved') {
          window.desktop!.finishCloseAttempt(attempt, true);
          return;
        }
        try {
          const saved = await saveCurrentPackage();
          window.desktop!.finishCloseAttempt(attempt, saved);
        } catch {
          setMessage(copy.editor.autoSaveFailed);
          window.desktop!.finishCloseAttempt(attempt, false);
        }
      }),
    [copy, saveCurrentPackage, saveStatus, setMessage],
  );

  useEffect(() => {
    if (!manageDocumentTitle) return;
    document.documentElement.lang = locale;
    document.title = copy.meta.editorTitle(fileName);
  }, [copy, fileName, locale, manageDocumentTitle]);

  return saveCurrentPackage;
}

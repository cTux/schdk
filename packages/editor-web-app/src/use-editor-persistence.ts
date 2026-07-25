import {
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  toDrivePackageReference,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import type { EditorSaveStatus } from '@schdk/ui/editor';
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
  saveDesktopEditorSession,
  saveDesktopRecentMetadata,
} from './desktop-session';
import { saveDraft } from './draft-storage';
import { savePackageLocally } from './local-package-save';

interface EditorPersistenceOptions {
  copy: LocalizationCopy;
  desktopSessionReady: boolean;
  drive?: DrivePackageStorage;
  driveConnected: boolean;
  driveFileId: string | null;
  fileName: string | null;
  filePath: string | null;
  gamePackage: GamePackage;
  hasPackage: boolean;
  locale: AppLocale;
  manageDocumentTitle: boolean;
  saveQueue: MutableRefObject<Promise<void>>;
  saveStatus: EditorSaveStatus;
  selectedIndex: number;
  currentPackage: MutableRefObject<GamePackage>;
  clearDraft(name: string): void;
  onDriveFailure?(): void;
  setMessage: Dispatch<SetStateAction<string>>;
  setSaveStatus: Dispatch<SetStateAction<EditorSaveStatus>>;
}

export function useEditorPersistence({
  copy,
  desktopSessionReady,
  drive,
  driveConnected,
  driveFileId,
  fileName,
  filePath,
  gamePackage,
  hasPackage,
  locale,
  manageDocumentTitle,
  saveQueue,
  saveStatus,
  selectedIndex,
  currentPackage,
  clearDraft,
  onDriveFailure,
  setMessage,
  setSaveStatus,
}: EditorPersistenceOptions) {
  const previousDriveConnected = useRef(driveConnected);
  const draftKey =
    (driveFileId && toDrivePackageReference(driveFileId)) || fileName;
  useEffect(() => {
    if (!window.desktop || !desktopSessionReady) return;
    saveDesktopEditorSession(
      localStorage,
      window.location.pathname,
      driveFileId && fileName
        ? { filePath: null, driveFileId, fileName, selectedIndex }
        : filePath
          ? { filePath, selectedIndex }
          : null,
    );
  }, [desktopSessionReady, driveFileId, fileName, filePath, selectedIndex]);

  useEffect(() => {
    if (!window.desktop || !filePath) return;
    saveDesktopRecentMetadata(
      localStorage,
      window.location.pathname,
      filePath,
      {
        title: gamePackage.title,
        ready: validateGamePackage(gamePackage).length === 0,
      },
    );
  }, [filePath, gamePackage]);

  const saveCurrentPackage = useCallback(async () => {
    const desktop = window.desktop;
    if (!driveFileId && (!filePath || !desktop)) return;
    if (driveFileId && (!drive || !driveConnected || !fileName)) {
      throw new Error('Google Drive is unavailable');
    }
    const content = serializeGamePackage(gamePackage);
    setSaveStatus('saving');
    const save = saveQueue.current
      .catch(() => undefined)
      .then(async () => {
        if (driveFileId) {
          await drive!.updateGamePackage(driveFileId, {
            name: fileName!,
            content,
            ready: validateGamePackage(gamePackage).length === 0,
          });
        } else {
          await desktop!.writeGamePackage(filePath!, content);
        }
      });
    saveQueue.current = save;
    try {
      await save;
      const isLatest = gamePackage === currentPackage.current;
      setSaveStatus(saveStatusAfterWrite(isLatest));
      if (isLatest && draftKey) clearDraft(draftKey);
    } catch (error) {
      setSaveStatus('error');
      if (driveFileId) onDriveFailure?.();
      throw error;
    }
  }, [
    clearDraft,
    currentPackage,
    drive,
    driveConnected,
    driveFileId,
    draftKey,
    fileName,
    filePath,
    gamePackage,
    onDriveFailure,
    saveQueue,
    setSaveStatus,
  ]);

  useEffect(() => {
    if (
      driveFileId &&
      driveConnected &&
      !previousDriveConnected.current &&
      saveStatus === 'error'
    ) {
      setSaveStatus('pending');
    }
    previousDriveConnected.current = driveConnected;
  }, [driveConnected, driveFileId, saveStatus, setSaveStatus]);

  useEffect(() => {
    if (!hasPackage || !draftKey || saveStatus !== 'pending') return;
    try {
      saveDraft(localStorage, draftKey, gamePackage);
    } catch {
      setMessage(copy.editor.draftSaveFailed);
    }
  }, [copy, draftKey, gamePackage, hasPackage, saveStatus, setMessage]);

  useEffect(() => {
    if (
      !shouldScheduleAutosave(
        saveStatus,
        Boolean(driveFileId && drive && driveConnected) ||
          Boolean(filePath && window.desktop),
      )
    ) {
      return;
    }
    return scheduleAutosave(async () => {
      try {
        await saveCurrentPackage();
      } catch {
        setMessage(copy.editor.autoSaveFailed);
      }
    });
  }, [
    copy,
    drive,
    driveConnected,
    driveFileId,
    filePath,
    saveCurrentPackage,
    saveStatus,
    setMessage,
  ]);

  useEffect(() => {
    window.desktop?.setEditorPackageOpen(hasPackage);
    return () => window.desktop?.setEditorPackageOpen(false);
  }, [hasPackage]);

  useEffect(
    () =>
      window.desktop?.onCloseRequested(async (attempt) => {
        if (saveStatus === 'saved') {
          window.desktop!.finishCloseAttempt(attempt, true);
          return;
        }
        try {
          await saveCurrentPackage();
          window.desktop!.finishCloseAttempt(attempt, true);
        } catch {
          if (driveFileId && fileName) {
            try {
              const saved = await savePackageLocally(
                currentPackage.current,
                fileName,
                copy.editor.filePickerDescription,
              );
              if (saved) {
                if (draftKey) clearDraft(draftKey);
                window.desktop!.finishCloseAttempt(attempt, true);
                return;
              }
            } catch {
              // Continue to the standard retry/discard/cancel close dialog.
            }
          }
          setMessage(copy.editor.autoSaveFailed);
          window.desktop!.finishCloseAttempt(attempt, false);
        }
      }),
    [
      clearDraft,
      copy,
      currentPackage,
      draftKey,
      driveFileId,
      fileName,
      saveCurrentPackage,
      saveStatus,
      setMessage,
    ],
  );

  useEffect(() => {
    if (!manageDocumentTitle) return;
    document.documentElement.lang = locale;
    document.title = copy.meta.editorTitle(fileName);
  }, [copy, fileName, locale, manageDocumentTitle]);

  return saveCurrentPackage;
}

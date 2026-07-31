import type { AppLocale, LocalizationCopy } from '@schdk/ui/localization';
import type { EditorSaveStatus } from '@schdk/ui/editor';
import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { saveDesktopEditorSession } from './desktop-session';

interface EditorLifecycleOptions {
  copy: LocalizationCopy;
  desktopSessionReady: boolean;
  driveActive: boolean;
  driveFileId: string | null;
  fileName: string | null;
  hasPackage: boolean;
  locale: AppLocale;
  manageDocumentTitle: boolean;
  saveStatus: EditorSaveStatus;
  selectedIndex: number;
  sessionScope: string;
  saveCurrentPackage(): Promise<boolean>;
  setMessage: Dispatch<SetStateAction<string>>;
  setSaveStatus: Dispatch<SetStateAction<EditorSaveStatus>>;
}

export function useEditorLifecycle({
  copy,
  desktopSessionReady,
  driveActive,
  driveFileId,
  fileName,
  hasPackage,
  locale,
  manageDocumentTitle,
  saveStatus,
  selectedIndex,
  sessionScope,
  saveCurrentPackage,
  setMessage,
  setSaveStatus,
}: EditorLifecycleOptions) {
  const previousDriveActive = useRef(driveActive);
  useEffect(() => {
    if (!window.desktop || !desktopSessionReady) return;
    saveDesktopEditorSession(
      localStorage,
      sessionScope,
      driveFileId && fileName ? { driveFileId, fileName, selectedIndex } : null,
    );
  }, [desktopSessionReady, driveFileId, fileName, selectedIndex, sessionScope]);

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
}

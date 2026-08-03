import type { EditorSaveStatus } from '@schdk/ui/editor';
import type { AppLocale } from '@schdk/common/app-settings';
import type { LocalizationCopy } from '@schdk/ui/localization';
import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { saveDesktopEditorSession } from './desktop-session';

interface DesktopSessionOptions {
  ready: boolean;
  driveFileId: string | null;
  fileName: string | null;
  selectedIndex: number;
  sessionScope: string;
}

interface CloseGuardOptions {
  copy: LocalizationCopy;
  hasPackage: boolean;
  saveStatus: EditorSaveStatus;
  saveCurrentPackage(): Promise<boolean>;
  setMessage: Dispatch<SetStateAction<string>>;
}

interface DocumentTitleOptions {
  copy: LocalizationCopy;
  enabled: boolean;
  fileName: string | null;
  locale: AppLocale;
}

function useDesktopEditorSession({
  ready,
  driveFileId,
  fileName,
  selectedIndex,
  sessionScope,
}: DesktopSessionOptions) {
  useEffect(() => {
    if (!window.desktop || !ready) return;
    saveDesktopEditorSession(
      localStorage,
      sessionScope,
      driveFileId && fileName ? { driveFileId, fileName, selectedIndex } : null,
    );
  }, [driveFileId, fileName, ready, selectedIndex, sessionScope]);
}

function useEditorCloseGuard({
  copy,
  hasPackage,
  saveStatus,
  saveCurrentPackage,
  setMessage,
}: CloseGuardOptions) {
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
}

function useEditorDocumentTitle({
  copy,
  enabled,
  fileName,
  locale,
}: DocumentTitleOptions) {
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.lang = locale;
    document.title = copy.meta.editorTitle(fileName);
  }, [copy, enabled, fileName, locale]);
}

export { useDesktopEditorSession, useEditorCloseGuard, useEditorDocumentTitle };

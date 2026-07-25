import {
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import type { EditorSaveStatus } from '@schdk/ui/editor';
import type { AppLocale, LocalizationCopy } from '@schdk/ui/localization';
import {
  useCallback,
  useEffect,
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

interface EditorPersistenceOptions {
  copy: LocalizationCopy;
  desktopSessionReady: boolean;
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
  setMessage: Dispatch<SetStateAction<string>>;
  setSaveStatus: Dispatch<SetStateAction<EditorSaveStatus>>;
}

export function useEditorPersistence({
  copy,
  desktopSessionReady,
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
  setMessage,
  setSaveStatus,
}: EditorPersistenceOptions) {
  useEffect(() => {
    if (!window.desktop || !desktopSessionReady) return;
    saveDesktopEditorSession(
      localStorage,
      window.location.pathname,
      filePath ? { filePath, selectedIndex } : null,
    );
  }, [desktopSessionReady, filePath, selectedIndex]);

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
    if (!filePath || !desktop) return;
    const content = serializeGamePackage(gamePackage);
    setSaveStatus('saving');
    const save = saveQueue.current
      .catch(() => undefined)
      .then(() => desktop.writeGamePackage(filePath, content));
    saveQueue.current = save;
    try {
      await save;
      const isLatest = gamePackage === currentPackage.current;
      setSaveStatus(saveStatusAfterWrite(isLatest));
      if (isLatest && fileName) clearDraft(fileName);
    } catch (error) {
      setSaveStatus('error');
      throw error;
    }
  }, [
    clearDraft,
    currentPackage,
    fileName,
    filePath,
    gamePackage,
    saveQueue,
    setSaveStatus,
  ]);

  useEffect(() => {
    if (!hasPackage || !fileName || saveStatus !== 'pending') return;
    try {
      saveDraft(localStorage, fileName, gamePackage);
    } catch {
      setMessage(copy.editor.draftSaveFailed);
    }
  }, [copy, fileName, gamePackage, hasPackage, saveStatus, setMessage]);

  useEffect(() => {
    if (
      !shouldScheduleAutosave(saveStatus, Boolean(filePath && window.desktop))
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
  }, [copy, filePath, saveCurrentPackage, saveStatus, setMessage]);

  useEffect(
    () =>
      window.desktop?.onCloseRequested(async (attempt) => {
        try {
          await saveCurrentPackage();
          window.desktop!.finishCloseAttempt(attempt, true);
        } catch {
          setMessage(copy.editor.autoSaveFailed);
          window.desktop!.finishCloseAttempt(attempt, false);
        }
      }),
    [copy, saveCurrentPackage, setMessage],
  );

  useEffect(() => {
    if (!manageDocumentTitle) return;
    document.documentElement.lang = locale;
    document.title = copy.meta.editorTitle(fileName);
  }, [copy, fileName, locale, manageDocumentTitle]);

  return saveCurrentPackage;
}

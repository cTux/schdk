import {
  parseGamePackage,
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  parseDrivePackageReference,
  toDrivePackageReference,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import type { LocalizationCopy } from '@schdk/ui/localization';
import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import { replaceBrowserPackageDeepLink } from './browser-deep-link';
import {
  saveDesktopEditorSession,
  type DesktopEditorSession,
} from './desktop-session';
import { loadRecentWebPackage } from './recent-packages';
import { loadDraft, removeDraft } from './draft-storage';

interface EditorOpeningOptions {
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  driveConnected: boolean;
  driveFileId: string | null;
  driveReady: boolean;
  fileName: string | null;
  hasPackage: boolean;
  selectedIndex: number;
  initialDeepLink: MutableRefObject<string | null>;
  initialDeepLinkedQuestion: MutableRefObject<number | null>;
  initialDesktopSession: MutableRefObject<DesktopEditorSession | null>;
  applyOpenedPackage(
    content: Uint8Array,
    filePath: string | null,
    fileName: string,
    driveFileId?: string | null,
    recovered?: boolean,
  ): GamePackage;
  refreshRecentPackages(): Promise<void>;
  rememberBrowserPackage(
    name: string,
    title: string,
    content: Uint8Array,
  ): Promise<void>;
  onDriveFailure?(): void;
  setDesktopSessionReady: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
}

export function useEditorOpening({
  copy,
  drive,
  driveConnected,
  driveFileId,
  driveReady,
  fileName,
  hasPackage,
  selectedIndex,
  initialDeepLink,
  initialDeepLinkedQuestion,
  initialDesktopSession,
  applyOpenedPackage,
  refreshRecentPackages,
  rememberBrowserPackage,
  onDriveFailure,
  setDesktopSessionReady,
  setMessage,
  setSelectedIndex,
}: EditorOpeningOptions) {
  useEffect(() => {
    if (!driveReady) return;
    if (!hasPackage) void refreshRecentPackages();
  }, [driveReady, hasPackage, refreshRecentPackages]);

  useEffect(() => {
    const packageReference = initialDeepLink.current;
    if (!driveReady || !packageReference) return;
    void (async () => {
      try {
        const driveId = parseDrivePackageReference(packageReference);
        if (driveId) {
          if (!driveConnected || !drive) {
            throw new Error('Google Drive is unavailable');
          }
          const opened = await drive.loadGamePackage(driveId);
          applyOpenedPackage(opened.content, null, opened.name, opened.id);
        } else {
          const content = await loadRecentWebPackage(packageReference);
          if (!content) throw new Error('Deep-linked package is unavailable');
          const openedPackage = applyOpenedPackage(
            content,
            null,
            packageReference,
          );
          await rememberBrowserPackage(
            packageReference,
            openedPackage.title,
            content,
          );
        }
        initialDeepLink.current = null;
        setSelectedIndex(initialDeepLinkedQuestion.current ?? 0);
      } catch {
        if (parseDrivePackageReference(packageReference)) onDriveFailure?.();
        initialDeepLink.current = null;
        replaceBrowserPackageDeepLink(null);
        setMessage(copy.editor.deepLinkOpenFailed);
      }
    })();
  }, [
    applyOpenedPackage,
    copy,
    drive,
    driveConnected,
    driveReady,
    initialDeepLink,
    initialDeepLinkedQuestion,
    rememberBrowserPackage,
    onDriveFailure,
    setMessage,
    setSelectedIndex,
  ]);

  useEffect(() => {
    if (!window.desktop && hasPackage && fileName) {
      replaceBrowserPackageDeepLink(
        driveFileId ? toDrivePackageReference(driveFileId) : fileName,
        selectedIndex,
      );
    }
  }, [driveFileId, fileName, hasPackage, selectedIndex]);

  useEffect(() => {
    const desktop = window.desktop;
    const session = initialDesktopSession.current;
    if (!desktop || !session || !driveReady) return;
    void (async () => {
      try {
        if (session.driveFileId && (!driveConnected || !drive)) {
          const reference = toDrivePackageReference(session.driveFileId);
          const draft = loadDraft(localStorage, reference);
          if (
            !draft ||
            !session.fileName ||
            !window.confirm(copy.editor.restoreDraft(session.fileName))
          ) {
            removeDraft(localStorage, reference);
            throw new Error('Google Drive recovery is unavailable');
          }
          applyOpenedPackage(
            serializeGamePackage(draft),
            null,
            session.fileName,
            session.driveFileId,
            true,
          );
        } else if (session.driveFileId) {
          const opened = await drive!.loadGamePackage(session.driveFileId);
          applyOpenedPackage(opened.content, null, opened.name, opened.id);
        } else if (session.filePath) {
          const opened = await desktop.openRecentGamePackage(session.filePath);
          if (driveConnected && drive) {
            const gamePackage = parseGamePackage(opened.content);
            const saved = await drive.createGamePackage({
              name: opened.fileName,
              content: opened.content,
              ready: validateGamePackage(gamePackage).length === 0,
            });
            applyOpenedPackage(opened.content, null, saved.name, saved.id);
          } else {
            applyOpenedPackage(
              opened.content,
              opened.filePath,
              opened.fileName,
            );
          }
        }
        initialDesktopSession.current = null;
        setSelectedIndex(session.selectedIndex);
      } catch {
        if (driveConnected) onDriveFailure?.();
        initialDesktopSession.current = null;
        saveDesktopEditorSession(localStorage, window.location.pathname, null);
        setMessage(copy.editor.restoreFileFailed);
      } finally {
        setDesktopSessionReady(true);
      }
    })();
  }, [
    applyOpenedPackage,
    copy,
    drive,
    driveConnected,
    driveReady,
    initialDesktopSession,
    onDriveFailure,
    setDesktopSessionReady,
    setMessage,
    setSelectedIndex,
  ]);
}

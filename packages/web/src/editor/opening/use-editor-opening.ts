import type { GamePackage } from '@schdk/common';
import {
  parseDrivePackageReference,
  toDrivePackageReference,
  type DrivePackageStorage,
  type DriveGamePackageFile,
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
} from '../persistence/desktop-session';

interface EditorOpeningOptions {
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  driveActive: boolean;
  driveFileId: string | null;
  hasPackage: boolean;
  sessionScope: string;
  selectedIndex: number;
  initialDeepLink: MutableRefObject<string | null>;
  initialDeepLinkedQuestion: MutableRefObject<number | null>;
  initialDesktopSession: MutableRefObject<DesktopEditorSession | null>;
  applyOpenedPackage(
    content: Uint8Array,
    opened: DriveGamePackageFile,
    selectedIndex?: number,
  ): GamePackage;
  refreshRecentPackages(): Promise<void>;
  onDriveFailure?(): void;
  setDesktopSessionReady: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
}

export function useEditorOpening({
  copy,
  drive,
  driveActive,
  driveFileId,
  hasPackage,
  sessionScope,
  selectedIndex,
  initialDeepLink,
  initialDeepLinkedQuestion,
  initialDesktopSession,
  applyOpenedPackage,
  refreshRecentPackages,
  onDriveFailure,
  setDesktopSessionReady,
  setMessage,
}: EditorOpeningOptions) {
  useEffect(() => {
    if (driveActive && !hasPackage) void refreshRecentPackages();
  }, [driveActive, hasPackage, refreshRecentPackages]);

  useEffect(() => {
    const packageReference = initialDeepLink.current;
    if (!packageReference) return;
    initialDeepLink.current = null;
    void (async () => {
      try {
        const driveId = parseDrivePackageReference(packageReference);
        if (!drive || !driveId) throw new Error('Google Drive is unavailable');
        const opened = await drive.loadGamePackage(driveId);
        applyOpenedPackage(
          opened.content,
          opened,
          initialDeepLinkedQuestion.current ?? 0,
        );
      } catch {
        onDriveFailure?.();
        replaceBrowserPackageDeepLink(null);
        setMessage(copy.editor.deepLinkOpenFailed);
      }
    })();
  }, [
    applyOpenedPackage,
    copy,
    drive,
    initialDeepLink,
    initialDeepLinkedQuestion,
    onDriveFailure,
    setMessage,
  ]);

  useEffect(() => {
    if (!window.desktop && hasPackage && driveFileId) {
      replaceBrowserPackageDeepLink(
        toDrivePackageReference(driveFileId),
        selectedIndex,
      );
    }
  }, [driveFileId, hasPackage, selectedIndex]);

  useEffect(() => {
    const session = initialDesktopSession.current;
    if (!window.desktop || !session) return;
    initialDesktopSession.current = null;
    void (async () => {
      try {
        if (!drive) {
          throw new Error('Google Drive session is unavailable');
        }
        const opened = await drive.loadGamePackage(session.driveFileId);
        applyOpenedPackage(opened.content, opened, session.selectedIndex);
      } catch {
        onDriveFailure?.();
        saveDesktopEditorSession(localStorage, sessionScope, null);
        setMessage(copy.editor.restoreFileFailed);
      } finally {
        setDesktopSessionReady(true);
      }
    })();
  }, [
    applyOpenedPackage,
    copy,
    drive,
    initialDesktopSession,
    onDriveFailure,
    sessionScope,
    setDesktopSessionReady,
    setMessage,
  ]);
}

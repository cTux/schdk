import {
  parseGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  parseDrivePackageReference,
  toDrivePackageReference,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import type { RecentPackageItem } from '@schdk/ui/editor';
import type { LocalizationCopy } from '@schdk/ui/localization';
import { replaceBrowserPackageDeepLink } from './browser-deep-link';
import { loadRecentWebPackage } from './recent-packages';

interface PackageOpeningOptions {
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  driveConnected: boolean;
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
  setMessage(message: string): void;
}

export function usePackageOpeningActions({
  copy,
  drive,
  driveConnected,
  applyOpenedPackage,
  refreshRecentPackages,
  rememberBrowserPackage,
  onDriveFailure,
  setMessage,
}: PackageOpeningOptions) {
  async function openPackage(file: File) {
    setMessage('');
    let content: Uint8Array;
    let gamePackage: GamePackage;
    try {
      const opened =
        window.desktop && !driveConnected
          ? await window.desktop.openGamePackage(file)
          : {
              filePath: null,
              content: new Uint8Array(await file.arrayBuffer()),
            };
      content = opened.content;
      gamePackage = parseGamePackage(content);
      if (!driveConnected || !drive) {
        const accepted = applyOpenedPackage(
          content,
          opened.filePath,
          file.name,
        );
        if (!window.desktop) {
          await rememberBrowserPackage(file.name, accepted.title, content);
          replaceBrowserPackageDeepLink(file.name, 0);
        }
        return;
      }
    } catch {
      setMessage(copy.editor.invalidFile);
      return;
    }
    try {
      const saved = await drive.createGamePackage({
        name: file.name,
        content,
        ready: validateGamePackage(gamePackage).length === 0,
      });
      applyOpenedPackage(content, null, saved.name, saved.id);
      replaceBrowserPackageDeepLink(toDrivePackageReference(saved.id), 0);
      await refreshRecentPackages();
    } catch {
      onDriveFailure?.();
      setMessage(copy.editor.saveFailed);
    }
  }

  async function openRecentPackage(recent: RecentPackageItem) {
    setMessage('');
    try {
      const driveFileId = parseDrivePackageReference(recent.id);
      if (driveFileId && driveConnected && drive) {
        const opened = await drive.loadGamePackage(driveFileId);
        applyOpenedPackage(opened.content, null, opened.name, opened.id);
        replaceBrowserPackageDeepLink(toDrivePackageReference(opened.id), 0);
      } else if (driveFileId) {
        throw new Error('Google Drive is unavailable');
      } else if (window.desktop) {
        const opened = await window.desktop.openRecentGamePackage(recent.id);
        applyOpenedPackage(opened.content, opened.filePath, opened.fileName);
      } else {
        const content = await loadRecentWebPackage(recent.id);
        if (!content) throw new Error('Recent package is unavailable');
        const openedPackage = applyOpenedPackage(content, null, recent.name);
        await rememberBrowserPackage(recent.name, openedPackage.title, content);
        replaceBrowserPackageDeepLink(recent.name, 0);
      }
      await refreshRecentPackages();
    } catch {
      if (parseDrivePackageReference(recent.id)) onDriveFailure?.();
      setMessage(copy.editor.recentOpenFailed);
      await refreshRecentPackages();
    }
  }

  return { openPackage, openRecentPackage };
}

import {
  hasGamePackageRemarks,
  MAX_GAME_PACKAGE_BYTES,
  parseGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  createGamePackageFilename,
  parseDrivePackageReference,
  toDrivePackageReference,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import { showEditorToast, type RecentPackageItem } from '@schdk/ui/editor';
import type { AppLocale, LocalizationCopy } from '@schdk/ui/localization';
import { useRef, useState } from 'react';
import { replaceBrowserPackageDeepLink } from './browser-deep-link';

interface PackageOpeningOptions {
  confirm(message: string): Promise<boolean>;
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  locale: AppLocale;
  applyOpenedPackage(
    content: Uint8Array,
    fileName: string,
    driveFileId: string,
  ): GamePackage;
  refreshRecentPackages(): Promise<void>;
  onDriveFailure?(): void;
  setMessage(message: string): void;
}

function downloadPackage(name: string, content: Uint8Array) {
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(content)], { type: 'application/zip' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function usePackageOpeningActions({
  confirm,
  copy,
  drive,
  locale,
  applyOpenedPackage,
  refreshRecentPackages,
  onDriveFailure,
  setMessage,
}: PackageOpeningOptions) {
  const openingRecentPackage = useRef<string | null>(null);
  const [openingRecentPackageId, setOpeningRecentPackageId] = useState<
    string | null
  >(null);

  async function openPackage(file: File) {
    if (openingRecentPackage.current) return;
    setMessage('');
    let content: Uint8Array;
    let gamePackage: GamePackage;
    try {
      if (file.size > MAX_GAME_PACKAGE_BYTES) {
        throw new Error('Package is too large');
      }
      content = new Uint8Array(await file.arrayBuffer());
      gamePackage = parseGamePackage(content);
    } catch {
      setMessage(copy.editor.invalidFile);
      return;
    }
    try {
      if (!drive) throw new Error('Google Drive is unavailable');
      const saved = await drive.createGamePackage({
        name: createGamePackageFilename(
          gamePackage.title,
          copy.editor.unfinishedGame,
        ),
        title: gamePackage.title,
        content,
        ready: validateGamePackage(gamePackage).length === 0,
        hasRemarks: hasGamePackageRemarks(gamePackage),
      });
      applyOpenedPackage(content, saved.name, saved.id);
      replaceBrowserPackageDeepLink(toDrivePackageReference(saved.id), 0);
      await refreshRecentPackages();
      showEditorToast('imported', locale);
    } catch {
      onDriveFailure?.();
      setMessage(copy.editor.saveFailed);
    }
  }

  async function openRecentPackage(recent: RecentPackageItem) {
    if (openingRecentPackage.current) return;
    openingRecentPackage.current = recent.id;
    setOpeningRecentPackageId(recent.id);
    setMessage('');
    try {
      const driveFileId = parseDrivePackageReference(recent.id);
      if (!drive || !driveFileId)
        throw new Error('Google Drive is unavailable');
      const opened = await drive.loadGamePackage(driveFileId);
      applyOpenedPackage(opened.content, opened.name, opened.id);
      replaceBrowserPackageDeepLink(toDrivePackageReference(opened.id), 0);
      await refreshRecentPackages();
      showEditorToast('opened', locale);
    } catch {
      onDriveFailure?.();
      setMessage(copy.editor.recentOpenFailed);
      await refreshRecentPackages();
    } finally {
      openingRecentPackage.current = null;
      setOpeningRecentPackageId(null);
    }
  }

  async function downloadRecentPackage(recent: RecentPackageItem) {
    if (openingRecentPackage.current) return;
    setMessage('');
    try {
      const driveFileId = parseDrivePackageReference(recent.id);
      if (!drive || !driveFileId)
        throw new Error('Google Drive is unavailable');
      const opened = await drive.loadGamePackage(driveFileId);
      if (window.desktop) {
        const savedPath = await window.desktop.saveGamePackage(
          opened.name,
          opened.content,
        );
        if (!savedPath) return;
      } else {
        downloadPackage(opened.name, opened.content);
      }
      showEditorToast('downloaded', locale);
    } catch {
      onDriveFailure?.();
      setMessage(copy.editor.downloadFailed);
    }
  }

  async function deleteRecentPackage(recent: RecentPackageItem) {
    if (
      openingRecentPackage.current ||
      !(await confirm(
        copy.shared.deletePackageConfirmation(recent.title || recent.name),
      ))
    ) {
      return;
    }
    openingRecentPackage.current = recent.id;
    setOpeningRecentPackageId(recent.id);
    setMessage('');
    try {
      const driveFileId = parseDrivePackageReference(recent.id);
      if (!drive || !driveFileId)
        throw new Error('Google Drive is unavailable');
      await drive.deleteGamePackage(driveFileId);
      await refreshRecentPackages();
      showEditorToast('deleted', locale);
    } catch {
      onDriveFailure?.();
      setMessage(copy.shared.deletePackageFailed);
    } finally {
      openingRecentPackage.current = null;
      setOpeningRecentPackageId(null);
    }
  }

  return {
    deleteRecentPackage,
    downloadRecentPackage,
    openingRecentPackageId,
    openPackage,
    openRecentPackage,
  };
}

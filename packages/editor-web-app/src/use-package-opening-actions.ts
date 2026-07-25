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
import { useRef, useState } from 'react';
import { replaceBrowserPackageDeepLink } from './browser-deep-link';

interface PackageOpeningOptions {
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
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
  copy,
  drive,
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
      content = new Uint8Array(await file.arrayBuffer());
      gamePackage = parseGamePackage(content);
    } catch {
      setMessage(copy.editor.invalidFile);
      return;
    }
    try {
      if (!drive) throw new Error('Google Drive is unavailable');
      const saved = await drive.createGamePackage({
        name: file.name,
        title: gamePackage.title,
        content,
        ready: validateGamePackage(gamePackage).length === 0,
      });
      applyOpenedPackage(content, saved.name, saved.id);
      replaceBrowserPackageDeepLink(toDrivePackageReference(saved.id), 0);
      await refreshRecentPackages();
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
        await window.desktop.saveGamePackage(opened.name, opened.content);
      } else {
        downloadPackage(opened.name, opened.content);
      }
    } catch {
      onDriveFailure?.();
      setMessage(copy.editor.downloadFailed);
    }
  }

  async function deleteRecentPackage(recent: RecentPackageItem) {
    if (
      openingRecentPackage.current ||
      !window.confirm(
        copy.shared.deletePackageConfirmation(recent.title || recent.name),
      )
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

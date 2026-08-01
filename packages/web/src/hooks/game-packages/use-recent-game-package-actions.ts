import {
  parseDrivePackageReference,
  type DriveGamePackage,
  type DrivePackageStorage,
} from '@schdk/google-drive/game-packages';
import type { RecentPackageItem } from '@schdk/ui/game-packages';
import { useRef, useState } from 'react';
import { downloadGamePackage } from '../../utils/game-packages/download-game-package';

interface RecentGamePackageActionOptions {
  confirm(message: string): Promise<boolean>;
  drive?: DrivePackageStorage;
  messages: {
    deleteConfirmation(recent: RecentPackageItem): string;
    deleteFailed: string;
    downloadFailed: string;
    openFailed: string;
  };
  onDriveFailure?(): void;
  onMessage(message: string): void;
  onOpen(opened: DriveGamePackage): Promise<void> | void;
  onOpened?(): void;
  onDownloaded?(): void;
  onDeleted?(): void;
  refreshRecentPackages(): Promise<void>;
}

export function useRecentGamePackageActions({
  confirm,
  drive,
  messages,
  onDriveFailure,
  onMessage,
  onOpen,
  onOpened,
  onDownloaded,
  onDeleted,
  refreshRecentPackages,
}: RecentGamePackageActionOptions) {
  const activePackage = useRef<string | null>(null);
  const [activePackageId, setActivePackageId] = useState<string | null>(null);

  async function withPackageLock(
    recent: RecentPackageItem,
    action: (driveFileId: string) => Promise<void>,
    showProgress = true,
  ) {
    if (activePackage.current) return;
    const driveFileId = parseDrivePackageReference(recent.id) ?? '';
    activePackage.current = recent.id;
    if (showProgress) setActivePackageId(recent.id);
    onMessage('');
    try {
      await action(driveFileId);
    } finally {
      activePackage.current = null;
      if (showProgress) setActivePackageId(null);
    }
  }

  async function openRecentPackage(recent: RecentPackageItem) {
    await withPackageLock(recent, async (driveFileId) => {
      try {
        await onOpen(await drive!.loadGamePackage(driveFileId));
        onOpened?.();
      } catch {
        onDriveFailure?.();
        onMessage(messages.openFailed);
        await refreshRecentPackages();
      }
    });
  }

  async function downloadRecentPackage(recent: RecentPackageItem) {
    await withPackageLock(
      recent,
      async (driveFileId) => {
        try {
          const opened = await drive!.loadGamePackage(driveFileId);
          if (await downloadGamePackage(opened.name, opened.content)) {
            onDownloaded?.();
          }
        } catch {
          onDriveFailure?.();
          onMessage(messages.downloadFailed);
        }
      },
      false,
    );
  }

  async function deleteRecentPackage(recent: RecentPackageItem) {
    if (
      activePackage.current ||
      !(await confirm(messages.deleteConfirmation(recent)))
    ) {
      return;
    }
    await withPackageLock(recent, async (driveFileId) => {
      try {
        await drive!.deleteGamePackage(driveFileId);
        await refreshRecentPackages();
        onDeleted?.();
      } catch {
        onDriveFailure?.();
        onMessage(messages.deleteFailed);
      }
    });
  }

  return {
    deleteRecentPackage,
    downloadRecentPackage,
    hasActiveAction: () => activePackage.current !== null,
    openingRecentPackageId: activePackageId,
    openRecentPackage,
  };
}

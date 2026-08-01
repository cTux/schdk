import {
  hasGamePackageRemarks,
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  createGamePackageFilename,
  type DriveGamePackageFile,
  type DrivePackageStorage,
} from '@schdk/google-drive/game-packages';
import type { LocalizationCopy } from '@schdk/ui/localization';
import { useCallback } from 'react';

interface DriveConflictResolutionOptions {
  confirm(message: string, confirmLabel?: string): Promise<boolean>;
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  driveFileId: string | null;
  applyOpenedPackage(
    content: Uint8Array,
    opened: DriveGamePackageFile,
    selectedIndex?: number,
  ): GamePackage;
  refreshRecentPackages(): Promise<void>;
}

export function useDriveConflictResolution({
  confirm,
  copy,
  drive,
  driveFileId,
  applyOpenedPackage,
  refreshRecentPackages,
}: DriveConflictResolutionOptions) {
  return useCallback(
    async (gamePackage: GamePackage) => {
      if (!drive || !driveFileId) return false;
      const shouldResolve = await confirm(
        copy.editor.driveConflict,
        copy.editor.resolveDriveConflict,
      );
      if (!shouldResolve) return false;

      const conflictCopy = {
        ...gamePackage,
        title: copy.editor.conflictCopyTitle(gamePackage.title),
      };
      await drive.createGamePackage({
        name: createGamePackageFilename(
          conflictCopy.title,
          copy.editor.unfinishedGame,
        ),
        title: conflictCopy.title,
        content: serializeGamePackage(conflictCopy),
        ready: validateGamePackage(conflictCopy).length === 0,
        hasRemarks: hasGamePackageRemarks(conflictCopy),
      });
      const latest = await drive.loadGamePackage(driveFileId);
      applyOpenedPackage(latest.content, latest);
      await refreshRecentPackages();
      return true;
    },
    [
      applyOpenedPackage,
      confirm,
      copy,
      drive,
      driveFileId,
      refreshRecentPackages,
    ],
  );
}

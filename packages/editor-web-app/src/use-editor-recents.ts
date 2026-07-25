import { parseGamePackage } from '@schdk/common';
import {
  toDrivePackageReference,
  type DriveGamePackageFile,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import type { RecentPackageItem } from '@schdk/ui/editor';
import { useCallback, useState } from 'react';

interface EditorRecentsOptions {
  drive?: DrivePackageStorage;
  onDriveFailure?(): void;
}

async function toRecentPackage(
  drive: DrivePackageStorage,
  { id, name, title, ready }: DriveGamePackageFile,
): Promise<RecentPackageItem> {
  if (title === undefined) {
    try {
      title = parseGamePackage((await drive.loadGamePackage(id)).content).title;
    } catch {
      // Legacy or unavailable packages still fall back to their filename.
    }
  }
  return {
    id: toDrivePackageReference(id),
    name,
    ...(title === undefined ? {} : { title }),
    ...(ready === undefined ? {} : { ready }),
  };
}

export function useEditorRecents({
  drive,
  onDriveFailure,
}: EditorRecentsOptions) {
  const [recentPackages, setRecentPackages] = useState<RecentPackageItem[]>([]);
  const [recentPackagesLoading, setRecentPackagesLoading] = useState(
    drive !== undefined,
  );

  const refreshRecentPackages = useCallback(async () => {
    if (!drive) {
      setRecentPackagesLoading(false);
      return;
    }
    setRecentPackagesLoading(true);
    try {
      setRecentPackages(
        await Promise.all(
          (await drive.listGamePackages()).map((file) =>
            toRecentPackage(drive, file),
          ),
        ),
      );
    } catch {
      setRecentPackages([]);
      onDriveFailure?.();
    } finally {
      setRecentPackagesLoading(false);
    }
  }, [drive, onDriveFailure]);

  return {
    recentPackages,
    recentPackagesLoading,
    refreshRecentPackages,
  };
}

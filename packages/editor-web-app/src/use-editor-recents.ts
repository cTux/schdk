import {
  toDrivePackageReference,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import type { RecentPackageItem } from '@schdk/ui/editor';
import { useCallback, useState } from 'react';

interface EditorRecentsOptions {
  drive?: DrivePackageStorage;
  onDriveFailure?(): void;
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
        (await drive.listGamePackages()).map(
          ({ id, name, ready, modifiedTime }) => ({
            id: toDrivePackageReference(id),
            name,
            openedAt: modifiedTime,
            ...(ready === undefined ? {} : { ready }),
          }),
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

import {
  toDrivePackageReference,
  type DriveGamePackageFile,
  type DrivePackageStorage,
} from '@schdk/google-drive/game-packages';
import type { RecentPackageItem } from '@schdk/ui/editor';
import { useCallback, useState } from 'react';

interface EditorRecentsOptions {
  drive?: DrivePackageStorage;
  onDriveFailure?(): void;
}

function toRecentPackage({
  id,
  name,
  title,
  ready,
  hasRemarks,
}: DriveGamePackageFile): RecentPackageItem {
  return {
    id: toDrivePackageReference(id),
    name,
    ...(title === undefined ? {} : { title }),
    ...(ready === undefined ? {} : { ready }),
    ...(hasRemarks === undefined ? {} : { hasRemarks }),
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
      setRecentPackages((await drive.listGamePackages()).map(toRecentPackage));
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

import type { DrivePackageStorage } from '@schdk/google-drive/game-packages';
import type { RecentPackageItem } from '@schdk/ui/game-packages';
import { useCallback, useState } from 'react';
import { toRecentGamePackage } from '../../utils/game-packages/to-recent-game-package';

export function useRecentGamePackages(
  drive?: DrivePackageStorage,
  onDriveFailure?: () => void,
) {
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
        (await drive.listGamePackages()).map(toRecentGamePackage),
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

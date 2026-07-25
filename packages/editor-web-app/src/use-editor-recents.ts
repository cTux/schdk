import {
  toDrivePackageReference,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import type { RecentPackageItem } from '@schdk/ui/editor';
import { useCallback, useState } from 'react';
import { loadDesktopRecentMetadata } from './desktop-session';
import { listRecentWebPackages, rememberWebPackage } from './recent-packages';

interface EditorRecentsOptions {
  drive?: DrivePackageStorage;
  driveConnected: boolean;
  driveReady: boolean;
  onDriveFailure?(): void;
}

export function useEditorRecents({
  drive,
  driveConnected,
  driveReady,
  onDriveFailure,
}: EditorRecentsOptions) {
  const [recentPackages, setRecentPackages] = useState<RecentPackageItem[]>([]);

  const refreshRecentPackages = useCallback(async () => {
    try {
      if (!driveReady) return;
      if (driveConnected && drive) {
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
        return;
      }
      if (!window.desktop) {
        setRecentPackages(await listRecentWebPackages());
        return;
      }
      const metadata = loadDesktopRecentMetadata(
        localStorage,
        window.location.pathname,
      );
      setRecentPackages(
        (await window.desktop.listRecentGamePackages()).map(
          ({ filePath: id, fileName: name }) => ({
            id,
            name,
            ...(metadata[id]
              ? {
                  title: metadata[id].title,
                  ...(metadata[id].ready === undefined
                    ? {}
                    : { ready: metadata[id].ready }),
                }
              : {}),
          }),
        ),
      );
    } catch {
      setRecentPackages([]);
      if (driveConnected) onDriveFailure?.();
    }
  }, [drive, driveConnected, driveReady, onDriveFailure]);

  const rememberBrowserPackage = useCallback(
    async (name: string, title: string, content: Uint8Array) => {
      try {
        await rememberWebPackage(name, title, content);
        await refreshRecentPackages();
      } catch {
        // IndexedDB is optional; opening and saving still work without recents.
      }
    },
    [refreshRecentPackages],
  );

  return { recentPackages, refreshRecentPackages, rememberBrowserPackage };
}

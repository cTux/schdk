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
import type { HostPackageDetails, RecentPackageItem } from '@schdk/ui/host';
import type { LocalizationCopy } from '@schdk/ui/localization';
import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { summarizeGamePackage } from './game-package-summary';
import type { HostSession } from './host-session';
import type { GameWizardSnapshot } from './use-game-wizard';

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

export function useHostPackages({
  copy,
  drive,
  onDriveFailure,
  setGameActive,
}: {
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  onDriveFailure?(): void;
  setGameActive: Dispatch<SetStateAction<boolean>>;
}) {
  const [message, setMessage] = useState('');
  const openingRecentPackage = useRef<string | null>(null);
  const [openingRecentPackageId, setOpeningRecentPackageId] = useState<
    string | null
  >(null);
  const [packageDetails, setPackageDetails] =
    useState<HostPackageDetails | null>(null);
  const [recentPackages, setRecentPackages] = useState<RecentPackageItem[]>([]);
  const [recentPackagesLoading, setRecentPackagesLoading] = useState(
    drive !== undefined,
  );
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(
    null,
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [wizardRestore, setWizardRestore] = useState<GameWizardSnapshot | null>(
    null,
  );

  const refreshRecentPackages = useCallback(async () => {
    if (!drive) {
      setRecentPackagesLoading(false);
      return;
    }
    setRecentPackagesLoading(true);
    try {
      setRecentPackages(
        (await drive.listGamePackages()).map(({ id, name, ready }) => ({
          id: toDrivePackageReference(id),
          name,
          ...(ready === undefined ? {} : { ready }),
        })),
      );
    } catch {
      setRecentPackages([]);
      onDriveFailure?.();
    } finally {
      setRecentPackagesLoading(false);
    }
  }, [drive, onDriveFailure]);

  const acceptPackage = useCallback(
    async (
      content: Uint8Array,
      fileName: string,
      packageId: string,
      restoredSession: HostSession | null = null,
    ) => {
      const gamePackage = parseGamePackage(content);
      if (validateGamePackage(gamePackage).length > 0) {
        throw new Error('Package is unfinished');
      }
      setWizardRestore(
        restoredSession
          ? {
              finished: restoredSession.finished,
              position: restoredSession.position,
            }
          : null,
      );
      setGameActive(restoredSession?.gameActive ?? false);
      setSelectedPackage(gamePackage);
      setSelectedPackageId(packageId);
      setPackageDetails({ fileName, ...summarizeGamePackage(gamePackage) });
      await refreshRecentPackages();
    },
    [refreshRecentPackages, setGameActive],
  );

  async function openPackage(file: File) {
    if (openingRecentPackage.current) return;
    setMessage('');
    let content: Uint8Array;
    try {
      content = new Uint8Array(await file.arrayBuffer());
      const gamePackage = parseGamePackage(content);
      if (validateGamePackage(gamePackage).length > 0) {
        throw new Error('Package is unfinished');
      }
    } catch {
      setMessage(copy.host.invalidFile);
      return;
    }
    try {
      if (!drive) throw new Error('Google Drive is unavailable');
      const saved = await drive.createGamePackage({
        name: file.name,
        content,
        ready: true,
      });
      await acceptPackage(
        content,
        saved.name,
        toDrivePackageReference(saved.id),
      );
    } catch {
      onDriveFailure?.();
      setMessage(copy.host.uploadFailed);
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
      await acceptPackage(
        opened.content,
        opened.name,
        toDrivePackageReference(opened.id),
      );
    } catch {
      onDriveFailure?.();
      setMessage(copy.host.recentOpenFailed);
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
      setMessage(copy.host.downloadFailed);
    }
  }

  function clearPackage() {
    setGameActive(false);
    setSelectedPackage(null);
    setSelectedPackageId(null);
    setPackageDetails(null);
    setMessage('');
  }

  return {
    acceptPackage,
    clearPackage,
    downloadRecentPackage,
    message,
    openingRecentPackageId,
    openPackage,
    openRecentPackage,
    packageDetails,
    recentPackages,
    recentPackagesLoading,
    refreshRecentPackages,
    selectedPackage,
    selectedPackageId,
    setMessage,
    setWizardRestore,
    wizardRestore,
  };
}

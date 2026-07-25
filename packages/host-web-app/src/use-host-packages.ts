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
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  listRecentWebPackages,
  loadRecentWebPackage,
  rememberWebPackage,
} from './recent-packages';
import { summarizeGamePackage } from './game-package-summary';
import type { HostSession } from './host-session';
import type { GameWizardSnapshot } from './use-game-wizard';

export function useHostPackages({
  copy,
  drive,
  driveConnected,
  driveReady,
  onDriveFailure,
  setGameActive,
}: {
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  driveConnected: boolean;
  driveReady: boolean;
  onDriveFailure?(): void;
  setGameActive: Dispatch<SetStateAction<boolean>>;
}) {
  const [message, setMessage] = useState('');
  const [packageDetails, setPackageDetails] =
    useState<HostPackageDetails | null>(null);
  const [recentPackages, setRecentPackages] = useState<RecentPackageItem[]>([]);
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
    try {
      if (!driveReady) return;
      if (driveConnected && drive) {
        setRecentPackages(
          (await drive.listGamePackages()).map(({ id, name, ready }) => ({
            id: toDrivePackageReference(id),
            name,
            ...(ready === undefined ? {} : { ready }),
          })),
        );
        return;
      }
      setRecentPackages(
        window.desktop
          ? (await window.desktop.listRecentGamePackages()).map(
              ({ filePath: id, fileName: name, content }) => {
                try {
                  const gamePackage = parseGamePackage(content);
                  return {
                    id,
                    name,
                    title: gamePackage.title,
                    ready: validateGamePackage(gamePackage).length === 0,
                  };
                } catch {
                  return { id, name };
                }
              },
            )
          : await listRecentWebPackages(),
      );
    } catch {
      setRecentPackages([]);
      if (driveConnected) onDriveFailure?.();
    }
  }, [drive, driveConnected, driveReady, onDriveFailure]);

  const acceptPackage = useCallback(
    async (
      content: Uint8Array,
      fileName: string,
      packageId = fileName,
      restoredSession: HostSession | null = null,
      driveBacked = false,
    ) => {
      const gamePackage = parseGamePackage(content);
      if (validateGamePackage(gamePackage).length > 0) {
        throw new Error('Package is unfinished');
      }
      if (!window.desktop && !driveBacked) {
        await rememberWebPackage(fileName, gamePackage.title, content);
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
    setMessage('');
    try {
      const opened = window.desktop
        ? await window.desktop.openHostGamePackage(file)
        : {
            filePath: file.name,
            content: new Uint8Array(await file.arrayBuffer()),
          };
      await acceptPackage(opened.content, file.name, opened.filePath);
    } catch {
      setMessage(copy.host.invalidFile);
    }
  }

  async function openRecentPackage(recent: RecentPackageItem) {
    setMessage('');
    try {
      const driveFileId = parseDrivePackageReference(recent.id);
      const opened = driveFileId
        ? driveConnected && drive
          ? await drive.loadGamePackage(driveFileId)
          : null
        : window.desktop
          ? await window.desktop.openRecentHostGamePackage(recent.id)
          : {
              fileName: recent.name,
              content: await loadRecentWebPackage(recent.id),
            };
      if (!opened?.content) throw new Error('Recent package is unavailable');
      await acceptPackage(
        opened.content,
        'fileName' in opened ? opened.fileName : opened.name,
        recent.id,
        null,
        Boolean(driveFileId),
      );
    } catch {
      if (parseDrivePackageReference(recent.id)) onDriveFailure?.();
      setMessage(copy.host.recentOpenFailed);
      await refreshRecentPackages();
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
    message,
    openPackage,
    openRecentPackage,
    packageDetails,
    recentPackages,
    refreshRecentPackages,
    selectedPackage,
    selectedPackageId,
    setMessage,
    setWizardRestore,
    wizardRestore,
  };
}

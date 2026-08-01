import {
  MAX_GAME_PACKAGE_BYTES,
  parseGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  createGamePackageFilename,
  toDrivePackageReference,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import type { HostPackageDetails } from '@schdk/ui/host';
import type { LocalizationCopy } from '@schdk/ui/localization';
import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useRecentGamePackageActions } from '../hooks/game-packages/use-recent-game-package-actions';
import { useRecentGamePackages } from '../hooks/game-packages/use-recent-game-packages';
import { summarizeGamePackage } from './game-package-summary';
import type { HostSession } from './host-session';
import type { GameWizardSnapshot } from './use-game-wizard';

export function useHostPackages({
  confirm,
  copy,
  drive,
  onDriveFailure,
  setGameActive,
}: {
  confirm(message: string): Promise<boolean>;
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  onDriveFailure?(): void;
  setGameActive: Dispatch<SetStateAction<boolean>>;
}) {
  const [message, setMessage] = useState('');
  const [packageDetails, setPackageDetails] =
    useState<HostPackageDetails | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(
    null,
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [wizardRestore, setWizardRestore] = useState<GameWizardSnapshot | null>(
    null,
  );

  const { recentPackages, recentPackagesLoading, refreshRecentPackages } =
    useRecentGamePackages(drive, onDriveFailure);

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

  const { hasActiveAction, ...recentActions } = useRecentGamePackageActions({
    confirm,
    drive,
    messages: {
      deleteConfirmation: (recent) =>
        copy.shared.deletePackageConfirmation(recent.title || recent.name),
      deleteFailed: copy.shared.deletePackageFailed,
      downloadFailed: copy.host.downloadFailed,
      openFailed: copy.host.recentOpenFailed,
    },
    onDriveFailure,
    onMessage: setMessage,
    onOpen: (opened) =>
      acceptPackage(
        opened.content,
        opened.name,
        toDrivePackageReference(opened.id),
      ),
    refreshRecentPackages,
  });

  async function openPackage(file: File) {
    if (hasActiveAction()) return;
    setMessage('');
    let content: Uint8Array;
    let gamePackage: GamePackage;
    try {
      if (file.size > MAX_GAME_PACKAGE_BYTES) {
        throw new Error('Package is too large');
      }
      content = new Uint8Array(await file.arrayBuffer());
      gamePackage = parseGamePackage(content);
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
        name: createGamePackageFilename(
          gamePackage.title,
          copy.shared.untitled,
        ),
        title: gamePackage.title,
        content,
        ready: true,
        hasRemarks: false,
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

  const clearPackage = useCallback(() => {
    setGameActive(false);
    setSelectedPackage(null);
    setSelectedPackageId(null);
    setPackageDetails(null);
    setMessage('');
  }, [setGameActive]);

  return {
    acceptPackage,
    clearPackage,
    ...recentActions,
    message,
    openPackage,
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

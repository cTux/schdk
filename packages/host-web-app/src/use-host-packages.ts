import {
  parseGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
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

export function useHostPackages(
  copy: LocalizationCopy,
  setGameActive: Dispatch<SetStateAction<boolean>>,
) {
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
    }
  }, []);

  const acceptPackage = useCallback(
    async (
      content: Uint8Array,
      fileName: string,
      packageId = fileName,
      restoredSession: HostSession | null = null,
    ) => {
      const gamePackage = parseGamePackage(content);
      if (validateGamePackage(gamePackage).length > 0) {
        throw new Error('Package is unfinished');
      }
      if (!window.desktop) {
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
      const opened = window.desktop
        ? await window.desktop.openRecentHostGamePackage(recent.id)
        : {
            fileName: recent.name,
            content: await loadRecentWebPackage(recent.id),
          };
      if (!opened.content) throw new Error('Recent package is unavailable');
      await acceptPackage(opened.content, opened.fileName, recent.id);
    } catch {
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

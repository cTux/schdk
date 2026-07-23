import { parseGamePackage, validateGamePackage } from '@schdk/common';
import {
  HostView,
  type HostPackageDetails,
  type RecentPackageItem,
} from '@schdk/ui/host';
import { useCallback, useEffect, useState } from 'react';
import {
  listRecentWebPackages,
  loadRecentWebPackage,
  rememberWebPackage,
} from './recent-packages';
import type {} from './electron';
import { summarizeGamePackage } from './game-package-summary';

export function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [packageDetails, setPackageDetails] =
    useState<HostPackageDetails | null>(null);
  const [recentPackages, setRecentPackages] = useState<RecentPackageItem[]>([]);

  const refreshRecentPackages = useCallback(async () => {
    try {
      setRecentPackages(
        window.desktop
          ? (await window.desktop.listRecentGamePackages()).map(
              ({ filePath: id, fileName: name }) => ({ id, name }),
            )
          : await listRecentWebPackages(),
      );
    } catch {
      setRecentPackages([]);
    }
  }, []);

  useEffect(() => {
    void refreshRecentPackages();
  }, [refreshRecentPackages]);

  async function acceptPackage(
    content: Uint8Array,
    fileName: string,
  ): Promise<void> {
    const gamePackage = parseGamePackage(content);
    if (validateGamePackage(gamePackage).length > 0) {
      throw new Error('Package is unfinished');
    }
    if (!window.desktop) {
      await rememberWebPackage(fileName, gamePackage.title, content);
    }
    setGameStarted(false);
    setPackageDetails({
      fileName,
      ...summarizeGamePackage(gamePackage),
    });
    await refreshRecentPackages();
  }

  async function openPackage(file: File) {
    setMessage('');
    try {
      const content = window.desktop
        ? (await window.desktop.openGamePackage(file)).content
        : new Uint8Array(await file.arrayBuffer());
      await acceptPackage(content, file.name);
    } catch {
      setMessage(
        'Не вдалося відкрити файл: пакет має неправильний формат або ще не готовий до гри.',
      );
    }
  }

  async function openRecentPackage(recent: RecentPackageItem) {
    setMessage('');
    try {
      const opened = window.desktop
        ? await window.desktop.openRecentGamePackage(recent.id)
        : {
            fileName: recent.name,
            content: await loadRecentWebPackage(recent.id),
          };
      if (!opened.content) throw new Error('Recent package is unavailable');
      await acceptPackage(opened.content, opened.fileName);
    } catch {
      setMessage(
        'Не вдалося відкрити недавній файл. Можливо, його переміщено, видалено або пакет ще не готовий до гри.',
      );
      await refreshRecentPackages();
    }
  }

  return (
    <HostView
      gameStarted={gameStarted}
      message={message}
      packageDetails={packageDetails}
      recentPackages={recentPackages}
      onBack={() => {
        setGameStarted(false);
        setPackageDetails(null);
        setMessage('');
      }}
      onOpenPackage={(file) => void openPackage(file)}
      onOpenRecentPackage={(recent) => void openRecentPackage(recent)}
      onStartGame={() => setGameStarted(true)}
    />
  );
}

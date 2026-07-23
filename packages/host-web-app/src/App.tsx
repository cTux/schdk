import {
  parseGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
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
import { setGameAudioVolume, unlockGameAudio } from './game-audio';
import { summarizeGamePackage } from './game-package-summary';
import { useGameWizard } from './use-game-wizard';

interface AppProps {
  soundVolume?: number;
}

export function App({ soundVolume = 0.4 }: AppProps) {
  const [gameActive, setGameActive] = useState(false);
  const [message, setMessage] = useState('');
  const [packageDetails, setPackageDetails] =
    useState<HostPackageDetails | null>(null);
  const [recentPackages, setRecentPackages] = useState<RecentPackageItem[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(
    null,
  );
  const wizard = useGameWizard(selectedPackage, gameActive);

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

  useEffect(() => {
    setGameAudioVolume(soundVolume);
  }, [soundVolume]);

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
    setGameActive(false);
    setSelectedPackage(gamePackage);
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

  function startGame() {
    unlockGameAudio();
    const host = document.getElementById('schdk-host-app');
    if (host && !document.fullscreenElement) {
      void host.requestFullscreen().catch(() => {
        // The fixed game surface remains usable when fullscreen is denied.
      });
    }
    setGameActive(true);
  }

  function returnToGames() {
    setGameActive(false);
    setSelectedPackage(null);
    setPackageDetails(null);
    setMessage('');
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {
        // Leaving the game must not depend on fullscreen support.
      });
    }
  }

  const game =
    gameActive && !wizard.finished && selectedPackage && wizard.question
      ? {
          question: wizard.question,
          questionNumber: wizard.position.questionIndex + 1,
          questionCount: selectedPackage.questions.length,
          currentStage: wizard.position.stage,
          visibleStages: wizard.visibleStages,
          remainingSeconds: wizard.remainingSeconds,
          transition: wizard.transition,
          controlsDisabled: wizard.controlsDisabled,
          canGoBack: wizard.canGoBack,
        }
      : null;

  return (
    <HostView
      finished={gameActive && wizard.finished}
      game={game}
      message={message}
      packageDetails={packageDetails}
      recentPackages={recentPackages}
      onBack={() => {
        setGameActive(false);
        setSelectedPackage(null);
        setPackageDetails(null);
        setMessage('');
      }}
      onGameBack={wizard.goBack}
      onGameNext={wizard.goNext}
      onOpenPackage={(file) => void openPackage(file)}
      onOpenRecentPackage={(recent) => void openRecentPackage(recent)}
      onReturnToGames={returnToGames}
      onStartGame={startGame}
    />
  );
}

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
import { useLocalization } from '@schdk/ui/localization';
import type { CustomGameElement, GameLayout } from '@schdk/ui/options';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listRecentWebPackages,
  loadRecentWebPackage,
  rememberWebPackage,
} from './recent-packages';
import type {} from './electron';
import { setGameAudioVolume, unlockGameAudio } from './game-audio';
import { summarizeGamePackage } from './game-package-summary';
import {
  getDeepLinkedHostSession,
  getHostDeepLink,
  loadHostSession,
  saveHostSession,
  type HostSession,
} from './host-session';
import { useGameWizard, type GameWizardSnapshot } from './use-game-wizard';

interface AppProps {
  backgroundImage?: string | null;
  backgroundOpacity?: number;
  customElements?: CustomGameElement[];
  layout?: GameLayout | null;
  soundVolume?: number;
}

export function App({
  backgroundImage = null,
  backgroundOpacity = 1,
  customElements = [],
  layout = null,
  soundVolume = 0.05,
}: AppProps) {
  const { copy } = useLocalization();
  const sessionScope = window.location.pathname;
  const initialSession = useRef(
    (window.desktop ? null : getDeepLinkedHostSession(window.location.href)) ??
      loadHostSession(localStorage, sessionScope),
  );
  const [sessionReady, setSessionReady] = useState(!initialSession.current);
  const [gameActive, setGameActive] = useState(false);
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
  const wizard = useGameWizard(selectedPackage, gameActive, wizardRestore);

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
    ): Promise<void> => {
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
      setPackageDetails({
        fileName,
        ...summarizeGamePackage(gamePackage),
      });
      await refreshRecentPackages();
    },
    [refreshRecentPackages],
  );

  useEffect(() => {
    void refreshRecentPackages();
  }, [refreshRecentPackages]);

  useEffect(() => {
    const session = initialSession.current;
    if (!session) return;
    initialSession.current = null;

    void (async () => {
      try {
        const opened = window.desktop
          ? await window.desktop.openRecentHostGamePackage(session.packageId)
          : {
              fileName: session.packageId,
              content: await loadRecentWebPackage(session.packageId),
            };
        if (!opened.content) throw new Error('Saved package is unavailable');
        await acceptPackage(
          opened.content,
          opened.fileName,
          session.packageId,
          session,
        );
      } catch {
        saveHostSession(localStorage, sessionScope, null);
        if (!window.desktop) {
          window.history.replaceState(
            window.history.state,
            '',
            getHostDeepLink(window.location.href, null),
          );
        }
        setMessage(copy.host.restoreFailed);
      } finally {
        setSessionReady(true);
      }
    })();
  }, [acceptPackage, copy, sessionScope]);

  useEffect(() => {
    setGameAudioVolume(soundVolume);
  }, [soundVolume]);

  useEffect(() => {
    if (!sessionReady) return;
    const session: HostSession | null =
      selectedPackage && selectedPackageId
        ? {
            packageId: selectedPackageId,
            gameActive,
            finished: wizard.finished,
            position: wizard.position,
          }
        : null;
    saveHostSession(localStorage, sessionScope, session);
    if (!window.desktop) {
      const deepLink = getHostDeepLink(window.location.href, session);
      if (deepLink !== window.location.href) {
        window.history.replaceState(window.history.state, '', deepLink);
      }
    }
  }, [
    gameActive,
    selectedPackage,
    selectedPackageId,
    sessionReady,
    sessionScope,
    wizard.finished,
    wizard.position,
  ]);

  useEffect(() => {
    if (!window.desktop) return;
    if (
      !gameActive ||
      wizard.finished ||
      !selectedPackage ||
      !wizard.question
    ) {
      window.desktop.setPresenterNotes(null);
      return;
    }
    window.desktop.setPresenterNotes({
      questionNumber: wizard.position.questionIndex + 1,
      questionCount: selectedPackage.questions.length,
      notes: wizard.question.hostNotes?.trim() ?? '',
    });
  }, [
    gameActive,
    selectedPackage,
    wizard.finished,
    wizard.position.questionIndex,
    wizard.question,
  ]);

  useEffect(
    () => () => {
      window.desktop?.setPresenterNotes(null);
    },
    [],
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

  function startGame() {
    unlockGameAudio();
    setWizardRestore(null);
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
    setSelectedPackageId(null);
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
      backgroundImage={backgroundImage}
      backgroundOpacity={backgroundOpacity}
      copy={copy}
      customElements={customElements}
      finished={gameActive && wizard.finished}
      game={game}
      layout={layout}
      message={message}
      packageDetails={packageDetails}
      recentPackages={recentPackages}
      onBack={() => {
        setGameActive(false);
        setSelectedPackage(null);
        setSelectedPackageId(null);
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

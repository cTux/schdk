import { parseDrivePackageReference } from '@schdk/google-drive';
import { HostView } from '@schdk/ui/host';
import { useLocalization } from '@schdk/ui/localization';
import { useEffect, useRef, useState } from 'react';
import type {} from './electron';
import { setGameAudioVolume, unlockGameAudio } from './game-audio';
import {
  getDeepLinkedHostSession,
  getHostDeepLink,
  loadHostSession,
  saveHostSession,
  type HostSession,
} from './host-session';
import { useGameWizard } from './use-game-wizard';
import { useHostPackages } from './use-host-packages';
import type { AppProps } from './types';

export type { AppProps } from './types';

export function App({
  backgroundImage = null,
  backgroundOpacity = 1,
  customElements = [],
  layout = null,
  soundVolume = 0.05,
  drive,
  driveActive = false,
  onDriveFailure,
}: AppProps) {
  const { copy } = useLocalization();
  const sessionScope = window.location.pathname;
  const initialSession = useRef(
    (window.desktop ? null : getDeepLinkedHostSession(window.location.href)) ??
      loadHostSession(localStorage, sessionScope),
  );
  const [sessionReady, setSessionReady] = useState(!initialSession.current);
  const [gameActive, setGameActive] = useState(false);
  const {
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
  } = useHostPackages({
    copy,
    drive,
    onDriveFailure,
    setGameActive,
  });
  const wizard = useGameWizard(selectedPackage, gameActive, wizardRestore);

  useEffect(() => {
    if (driveActive) void refreshRecentPackages();
  }, [driveActive, refreshRecentPackages]);

  useEffect(() => {
    const session = initialSession.current;
    if (!session) return;
    initialSession.current = null;
    void (async () => {
      try {
        const driveFileId = parseDrivePackageReference(session.packageId);
        if (!driveFileId || !drive) {
          throw new Error('Saved Drive package is unavailable');
        }
        const opened = await drive.loadGamePackage(driveFileId);
        await acceptPackage(
          opened.content,
          opened.name,
          session.packageId,
          session,
        );
      } catch {
        if (parseDrivePackageReference(session.packageId)) onDriveFailure?.();
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
  }, [acceptPackage, copy, drive, onDriveFailure, sessionScope, setMessage]);

  useEffect(() => setGameAudioVolume(soundVolume), [soundVolume]);

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
    clearPackage();
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
          currentQuestionPartIndex: wizard.position.questionPartIndex,
          currentStage: wizard.position.stage,
          visibleStages: wizard.visibleStages,
          remainingSeconds: wizard.remainingSeconds,
          transition: wizard.transition,
          controlsDisabled: wizard.controlsDisabled,
          canGoBack: wizard.canGoBack,
        }
      : null;

  if (!driveActive) return null;
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
      openingRecentPackageId={openingRecentPackageId}
      packageDetails={packageDetails}
      recentPackages={recentPackages}
      recentPackagesLoading={recentPackagesLoading}
      onBack={clearPackage}
      onGameBack={wizard.goBack}
      onGameNext={wizard.goNext}
      onDownloadRecentPackage={(recent) => void downloadRecentPackage(recent)}
      onOpenPackage={(file) => void openPackage(file)}
      onOpenRecentPackage={(recent) => void openRecentPackage(recent)}
      onReturnToGames={returnToGames}
      onStartGame={startGame}
    />
  );
}

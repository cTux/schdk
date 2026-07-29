import { parseDrivePackageReference } from '@schdk/google-drive';
import { QUESTIONS_PER_ROUND } from '@schdk/common';
import { ConfirmationDialog, useConfirmationDialog } from '@schdk/ui';
import { HostView } from '@schdk/ui/host';
import { useLocalization } from '@schdk/ui/localization';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { usePresenterNotes } from './use-presenter-notes';
import type { AppProps } from './types';

function App({
  autoFullscreen = true,
  backgroundImage = null,
  backgroundOpacity = 1,
  customElements = [],
  layout = null,
  musicVolume = 0.05,
  soundVolume = 0.05,
  drive,
  driveActive = false,
  sessionScope = window.location.pathname,
  onDriveFailure,
}: AppProps) {
  const { copy } = useLocalization();
  const { confirm, dialogProps } = useConfirmationDialog();
  const initialSession = useRef(
    (window.desktop ? null : getDeepLinkedHostSession(window.location.href)) ??
      loadHostSession(localStorage, sessionScope),
  );
  const [sessionReady, setSessionReady] = useState(!initialSession.current);
  const [gameActive, setGameActive] = useState(false);
  const {
    acceptPackage,
    clearPackage,
    deleteRecentPackage,
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
    confirm,
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

  usePresenterNotes({
    active: gameActive,
    finished: wizard.finished,
    gamePackage: selectedPackage,
    position: wizard.position,
    question: wizard.question,
  });

  function startGame() {
    unlockGameAudio();
    setWizardRestore(null);
    const host = document.getElementById('schdk-host-app');
    if (autoFullscreen && host && !document.fullscreenElement) {
      void host.requestFullscreen().catch(() => {
        // The fixed game surface remains usable when fullscreen is denied.
      });
    }
    setGameActive(true);
  }

  const returnToGames = useCallback(() => {
    clearPackage();
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {
        // Leaving the game must not depend on fullscreen support.
      });
    }
  }, [clearPackage]);

  useEffect(() => {
    if (!gameActive) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.code !== 'KeyQ' ||
        event.ctrlKey ||
        event.shiftKey ||
        !event.altKey ||
        event.metaKey ||
        event.repeat
      ) {
        return;
      }
      event.preventDefault();
      void confirm(copy.host.exitGameConfirmation).then((confirmed) => {
        if (confirmed) returnToGames();
      });
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirm, copy.host.exitGameConfirmation, gameActive, returnToGames]);

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
          musicBreak:
            wizard.position.stage === 'musicBreak'
              ? (selectedPackage.musicBreaks[
                  Math.floor(
                    wizard.position.questionIndex / QUESTIONS_PER_ROUND,
                  )
                ] ?? null)
              : null,
          musicVolume,
        }
      : null;

  if (!driveActive) return null;
  return (
    <>
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
        onDeleteRecentPackage={(recent) => void deleteRecentPackage(recent)}
        onGameBack={wizard.goBack}
        onGameNext={wizard.goNext}
        onDownloadRecentPackage={(recent) => void downloadRecentPackage(recent)}
        onOpenPackage={(file) => void openPackage(file)}
        onOpenRecentPackage={(recent) => void openRecentPackage(recent)}
        onReturnToGames={returnToGames}
        onStartGame={startGame}
      />
      <ConfirmationDialog {...dialogProps} />
    </>
  );
}

export { App, type AppProps };

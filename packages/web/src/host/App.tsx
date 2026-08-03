import { parseDrivePackageReference } from '@schdk/google-drive';
import { DEFAULT_GAME_OPTIONS, QUESTIONS_PER_ROUND } from '@schdk/common';
import { ConfirmationDialog, useConfirmationDialog } from '@schdk/ui';
import { HostView } from '@schdk/ui/host';
import { useLocalization } from '@schdk/ui/localization';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  drive,
  driveActive = false,
  options = DEFAULT_GAME_OPTIONS,
  sessionScope = window.location.pathname,
  onDriveFailure,
  onExit,
}: AppProps) {
  const {
    autoFullscreen,
    backgroundGradientDirection,
    backgroundGradientFrom,
    backgroundGradientTo,
    backgroundImage,
    backgroundOpacity,
    customElements,
    layout,
    musicVolume,
    soundVolume,
  } = options;
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
    if (!session || !driveActive || !drive) return;
    initialSession.current = null;
    void (async () => {
      try {
        const driveFileId = parseDrivePackageReference(session.packageId);
        if (!driveFileId) {
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
  }, [
    acceptPackage,
    copy,
    drive,
    driveActive,
    onDriveFailure,
    sessionScope,
    setMessage,
  ]);

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
    const shouldEnterFullscreen =
      autoFullscreen && host && !document.fullscreenElement;
    if (shouldEnterFullscreen) {
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
      const isExitGameShortcut =
        event.code === 'KeyQ' &&
        !event.ctrlKey &&
        !event.shiftKey &&
        event.altKey &&
        !event.metaKey &&
        !event.repeat;
      if (!isExitGameShortcut) return;
      event.preventDefault();
      void confirm(copy.host.exitGameConfirmation).then((confirmed) => {
        if (confirmed) returnToGames();
      });
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirm, copy.host.exitGameConfirmation, gameActive, returnToGames]);

  const hasActiveQuestion =
    gameActive && !wizard.finished && selectedPackage && wizard.question;
  const game = hasActiveQuestion
    ? {
        question: wizard.question!,
        questionNumber: wizard.position.questionIndex + 1,
        questionCount: selectedPackage.questions.length,
        tourNumber:
          Math.floor(wizard.position.questionIndex / QUESTIONS_PER_ROUND) + 1,
        tourPhrase:
          selectedPackage.tourPhrases[
            Math.floor(wizard.position.questionIndex / QUESTIONS_PER_ROUND)
          ] ?? '',
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
                Math.floor(wizard.position.questionIndex / QUESTIONS_PER_ROUND)
              ] ?? null)
            : null,
        musicVolume,
      }
    : null;

  if (!driveActive) return null;
  return (
    <>
      <HostView
        copy={copy}
        message={message}
        onExit={onExit ?? (() => undefined)}
        presentation={{
          backgroundImage,
          backgroundOpacity,
          backgroundGradientFrom,
          backgroundGradientTo,
          backgroundGradientDirection,
          customElements,
          layout,
        }}
        packages={{
          openingRecentPackageId,
          packageDetails,
          recentPackages,
          recentPackagesLoading,
          onBack: clearPackage,
          onDelete: (recent) => void deleteRecentPackage(recent),
          onDownload: (recent) => void downloadRecentPackage(recent),
          onOpen: (file) => void openPackage(file),
          onOpenRecent: (recent) => void openRecentPackage(recent),
          onStart: startGame,
        }}
        session={{
          finished: gameActive && wizard.finished,
          game,
          onBack: wizard.goBack,
          onNext: wizard.goNext,
          onReturn: returnToGames,
        }}
      />
      <ConfirmationDialog {...dialogProps} />
    </>
  );
}

export { App, type AppProps };

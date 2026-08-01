import { createEmptyGamePackage, parseGamePackage } from '@schdk/common';
import type { DriveGamePackageFile } from '@schdk/google-drive/game-packages';
import { ConfirmationDialog, useConfirmationDialog } from '@schdk/ui';
import { EditorView } from '@schdk/ui/editor';
import { useLocalization } from '@schdk/ui/localization';
import { DEFAULT_EDITOR_TEXT_OPTIONS } from '@schdk/ui/options';
import { useCallback, useRef, useState } from 'react';
import {
  getDeepLinkedPackageName,
  getDeepLinkedQuestionIndex,
} from './opening/deep-link';
import { useEditorOpening } from './opening/use-editor-opening';
import { useEditorRecents } from './opening/use-editor-recents';
import { loadDesktopEditorSession } from './persistence/desktop-session';
import { useDriveConflictResolution } from './persistence/use-drive-conflict-resolution';
import { useEditorPersistence } from './persistence/use-editor-persistence';
import { useMusicBreakChange } from './questions/use-music-break-change';
import { useQuestionActions } from './questions/use-question-actions';
import { useEditorSession } from './session/use-editor-session';
import { usePackageActions } from './use-package-actions';
import type { AppProps } from './types';

function App({
  aiGeneration,
  drive,
  driveActive = false,
  manageDocumentTitle = true,
  questionDatabaseRows = [],
  sessionScope = window.location.pathname,
  textOptions = DEFAULT_EDITOR_TEXT_OPTIONS,
  onDriveFailure,
  onExit,
}: AppProps = {}) {
  const { copy, locale } = useLocalization();
  const { confirm, dialogProps } = useConfirmationDialog();
  const createLocalizedPackage = () => ({
    ...createEmptyGamePackage(),
    title: copy.shared.untitled,
  });
  const session = useEditorSession(copy.shared.untitled);
  const {
    driveFileId,
    gamePackage,
    hasPackage,
    openPackage,
    saveStatus,
    selectedIndex,
    setSelectedIndex,
  } = session;
  const currentPackage = useRef(gamePackage);
  const saveQueue = useRef(Promise.resolve());
  const initialDeepLink = useRef(
    window.desktop ? null : getDeepLinkedPackageName(window.location.href),
  );
  const initialDeepLinkedQuestion = useRef(
    window.desktop ? null : getDeepLinkedQuestionIndex(window.location.href),
  );
  const initialDesktopSession = useRef(
    window.desktop
      ? loadDesktopEditorSession(localStorage, sessionScope)
      : null,
  );
  const [desktopSessionReady, setDesktopSessionReady] = useState(
    !initialDesktopSession.current,
  );
  const [showValidation, setShowValidation] = useState(false);
  const [message, setMessage] = useState('');
  currentPackage.current = gamePackage;

  const applyOpenedPackage = useCallback(
    (content: Uint8Array, opened: DriveGamePackageFile, selectedIndex = 0) => {
      const packageToEdit = parseGamePackage(content);
      openPackage(packageToEdit, opened, selectedIndex);
      setShowValidation(false);
      return packageToEdit;
    },
    [openPackage],
  );

  const { recentPackages, recentPackagesLoading, refreshRecentPackages } =
    useEditorRecents({ drive, onDriveFailure });
  useEditorOpening({
    copy,
    driveActive,
    hasPackage,
    selectedIndex,
    initialDeepLink,
    initialDeepLinkedQuestion,
    initialDesktopSession,
    applyOpenedPackage,
    refreshRecentPackages,
    drive,
    driveFileId,
    sessionScope,
    onDriveFailure,
    setDesktopSessionReady,
    setMessage,
  });
  const resolveDriveConflict = useDriveConflictResolution({
    confirm,
    copy,
    drive,
    driveFileId,
    applyOpenedPackage,
    refreshRecentPackages,
  });
  const saveCurrentPackage = useEditorPersistence({
    copy,
    currentPackage,
    desktopSessionReady,
    drive,
    driveActive,
    locale,
    manageDocumentTitle,
    saveQueue,
    session,
    sessionScope,
    onDriveFailure,
    resolveDriveConflict,
    setMessage,
  });
  const questions = useQuestionActions({
    confirm,
    copy,
    currentPackage,
    drive,
    gamePackage,
    locale,
    selectedIndex,
    textOptions,
    onDriveFailure,
    changeGamePackage: session.changeGamePackage,
    setMessage,
    setSelectedIndex,
  });
  const changeMusicBreak = useMusicBreakChange(
    copy,
    session.changeGamePackage,
    setMessage,
  );
  const packages = usePackageActions({
    confirm,
    copy,
    drive,
    driveFileId,
    locale,
    saveStatus,
    applyOpenedPackage,
    createLocalizedPackage,
    refreshRecentPackages,
    saveCurrentPackage,
    onDriveFailure,
    changeGamePackage: session.changeGamePackage,
    resetPackage: session.resetPackage,
    setMessage,
    setShowValidation,
  });

  if (!driveActive) return null;
  return (
    <>
      <EditorView
        key={driveFileId ?? 'no-package'}
        aiGeneration={aiGeneration}
        document={{
          gamePackage,
          hasPackage,
          message,
          questionDatabaseRows,
          saveStatus,
          selectedIndex,
          showValidation,
        }}
        recents={{
          openingRecentPackageId: packages.openingRecentPackageId,
          recentPackages,
          recentPackagesLoading,
          onDeleteRecentPackage: (recent) =>
            void packages.deleteRecentPackage(recent),
          onDownloadRecentPackage: (recent) =>
            void packages.downloadRecentPackage(recent),
          onOpenRecentPackage: (recent) =>
            void packages.openRecentPackage(recent),
        }}
        packageActions={{
          onBack: () => void packages.closePackage(),
          onExit: onExit ?? (() => undefined),
          onCreatePackage: () => void packages.createPackage(),
          onDeletePackage: () => void packages.deletePackage(gamePackage.title),
          onOpenPackage: (file) => void packages.openPackage(file),
          onTourPhraseChange: packages.updateTourPhrase,
          onTitleChange: (title) => {
            session.changeGamePackage({ ...gamePackage, title });
            setMessage('');
          },
        }}
        questionActions={{
          onAddHandout: questions.addHandout,
          onMusicBreakChange: changeMusicBreak,
          onAnswerBlur: questions.correctMainAnswer,
          onAnswerCommentBlur: questions.correctAnswerComment,
          onAlternativeAnswerBlur: questions.correctAlternativeAnswer,
          onWrongAnswerBlur: questions.correctWrongAnswer,
          onCopyQuestion: () => void questions.copyQuestion(),
          onPasteQuestion: () => void questions.pasteQuestion(),
          onQuestionChange: questions.updateQuestion,
          onDatabaseQuestionSelect: questions.selectDatabaseQuestion,
          onQuestionGenerated: questions.replaceQuestion,
          onQuestionTextBlur: questions.correctQuestionText,
          onSelectQuestion: setSelectedIndex,
          onSwapQuestions: questions.swapQuestionPositions,
        }}
      />
      <ConfirmationDialog {...dialogProps} />
    </>
  );
}

export { App, type AppProps };

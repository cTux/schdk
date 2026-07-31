import {
  createEmptyGamePackage,
  parseGamePackage,
  type GamePackage,
} from '@schdk/common';
import type { DriveGamePackageFile } from '@schdk/google-drive';
import { ConfirmationDialog, useConfirmationDialog } from '@schdk/ui';
import { EditorView, type EditorSaveStatus } from '@schdk/ui/editor';
import { useLocalization } from '@schdk/ui/localization';
import { DEFAULT_EDITOR_TEXT_OPTIONS } from '@schdk/ui/options';
import { useCallback, useRef, useState } from 'react';
import {
  getDeepLinkedPackageName,
  getDeepLinkedQuestionIndex,
} from './deep-link';
import { loadDesktopEditorSession } from './desktop-session';
import { useDriveConflictResolution } from './use-drive-conflict-resolution';
import { useEditorOpening } from './use-editor-opening';
import { useEditorPersistence } from './use-editor-persistence';
import { useEditorRecents } from './use-editor-recents';
import { useMusicBreakChange } from './use-music-break-change';
import { usePackageActions } from './use-package-actions';
import { useQuestionActions } from './use-question-actions';
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
}: AppProps = {}) {
  const { copy, locale } = useLocalization();
  const { confirm, dialogProps } = useConfirmationDialog();
  const createLocalizedPackage = () => ({
    ...createEmptyGamePackage(),
    title: copy.shared.untitled,
  });
  const [gamePackage, setGamePackage] = useState<GamePackage>(
    createLocalizedPackage,
  );
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
  const [hasPackage, setHasPackage] = useState(false);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [driveModifiedTime, setDriveModifiedTime] = useState<string | null>(
    null,
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>('saved');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [message, setMessage] = useState('');
  currentPackage.current = gamePackage;

  const applyOpenedPackage = useCallback(
    (content: Uint8Array, opened: DriveGamePackageFile) => {
      const packageToEdit = parseGamePackage(content);
      setGamePackage(packageToEdit);
      setDriveFileId(opened.id);
      setDriveModifiedTime(opened.modifiedTime);
      setFileName(opened.name);
      setSaveStatus('saved');
      setHasPackage(true);
      setSelectedIndex(0);
      setShowValidation(false);
      return packageToEdit;
    },
    [],
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
    setSelectedIndex,
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
    driveFileId,
    driveModifiedTime,
    fileName,
    gamePackage,
    hasPackage,
    locale,
    manageDocumentTitle,
    saveQueue,
    saveStatus,
    sessionScope,
    selectedIndex,
    onDriveFailure,
    resolveDriveConflict,
    setFileName,
    setDriveModifiedTime,
    setMessage,
    setSaveStatus,
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
    setGamePackage,
    setMessage,
    setSaveStatus,
    setSelectedIndex,
  });
  const changeMusicBreak = useMusicBreakChange(
    copy,
    setGamePackage,
    setMessage,
    setSaveStatus,
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
    setFileName,
    setDriveFileId,
    setDriveModifiedTime,
    setGamePackage,
    setHasPackage,
    setMessage,
    setSaveStatus,
    setSelectedIndex,
    setShowValidation,
  });

  if (!driveActive) return null;
  return (
    <>
      <EditorView
        key={driveFileId ?? 'no-package'}
        aiGeneration={aiGeneration}
        gamePackage={gamePackage}
        hasPackage={hasPackage}
        message={message}
        questionDatabaseRows={questionDatabaseRows}
        openingRecentPackageId={packages.openingRecentPackageId}
        recentPackages={recentPackages}
        recentPackagesLoading={recentPackagesLoading}
        saveStatus={saveStatus}
        selectedIndex={selectedIndex}
        showValidation={showValidation}
        onAddHandout={questions.addHandout}
        onMusicBreakChange={changeMusicBreak}
        onAnswerBlur={questions.correctMainAnswer}
        onAnswerCommentBlur={questions.correctAnswerComment}
        onAlternativeAnswerBlur={questions.correctAlternativeAnswer}
        onWrongAnswerBlur={questions.correctWrongAnswer}
        onBack={() => void packages.closePackage()}
        onCopyQuestion={() => void questions.copyQuestion()}
        onCreatePackage={() => void packages.createPackage()}
        onDeletePackage={() => void packages.deletePackage(gamePackage.title)}
        onDeleteRecentPackage={(recent) =>
          void packages.deleteRecentPackage(recent)
        }
        onDownloadRecentPackage={(recent) =>
          void packages.downloadRecentPackage(recent)
        }
        onOpenPackage={(file) => void packages.openPackage(file)}
        onOpenRecentPackage={(recent) =>
          void packages.openRecentPackage(recent)
        }
        onPasteQuestion={() => void questions.pasteQuestion()}
        onQuestionChange={questions.updateQuestion}
        onDatabaseQuestionSelect={questions.selectDatabaseQuestion}
        onQuestionGenerated={questions.replaceQuestion}
        onQuestionTextBlur={questions.correctQuestionText}
        onSelectQuestion={setSelectedIndex}
        onSwapQuestions={questions.swapQuestionPositions}
        onTourPhraseChange={packages.updateTourPhrase}
        onTitleChange={(title) => {
          setGamePackage({ ...gamePackage, title });
          setSaveStatus('pending');
          setMessage('');
        }}
      />
      <ConfirmationDialog {...dialogProps} />
    </>
  );
}

export { App, type AppProps };

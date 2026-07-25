import {
  createEmptyGamePackage,
  parseGamePackage,
  type GamePackage,
} from '@schdk/common';
import { toDrivePackageReference } from '@schdk/google-drive';
import { EditorView, type EditorSaveStatus } from '@schdk/ui/editor';
import { useLocalization } from '@schdk/ui/localization';
import { DEFAULT_EDITOR_TEXT_OPTIONS } from '@schdk/ui/options';
import { useCallback, useRef, useState } from 'react';
import {
  getDeepLinkedPackageName,
  getDeepLinkedQuestionIndex,
} from './deep-link';
import { loadDesktopEditorSession } from './desktop-session';
import { loadDraft, removeDraft } from './draft-storage';
import type {} from './electron';
import { useEditorOpening } from './use-editor-opening';
import { useEditorPersistence } from './use-editor-persistence';
import { useEditorRecents } from './use-editor-recents';
import { usePackageActions } from './use-package-actions';
import { useQuestionActions } from './use-question-actions';
import type { AppProps } from './types';

export type { AppProps } from './types';

export function App({
  drive,
  driveConnected = false,
  driveReady = true,
  manageDocumentTitle = true,
  textOptions = DEFAULT_EDITOR_TEXT_OPTIONS,
  onDriveFailure,
}: AppProps = {}) {
  const { copy, locale } = useLocalization();
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
      ? loadDesktopEditorSession(localStorage, window.location.pathname)
      : null,
  );
  const [desktopSessionReady, setDesktopSessionReady] = useState(
    !initialDesktopSession.current,
  );
  const [hasPackage, setHasPackage] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>('saved');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [message, setMessage] = useState('');
  currentPackage.current = gamePackage;

  const clearDraft = useCallback(
    (name: string) => {
      try {
        removeDraft(localStorage, name);
      } catch {
        setMessage(copy.editor.savedDraftRemovalFailed);
      }
    },
    [copy],
  );

  const applyOpenedPackage = useCallback(
    (
      content: Uint8Array,
      openedFilePath: string | null,
      openedName: string,
      openedDriveFileId: string | null = null,
      recovered = false,
    ) => {
      const parsedPackage = parseGamePackage(content);
      const draftKey = openedDriveFileId
        ? toDrivePackageReference(openedDriveFileId)
        : openedName;
      let packageToEdit = parsedPackage;
      let restored = recovered;
      if (!recovered) {
        try {
          const draft = loadDraft(localStorage, draftKey);
          if (draft) {
            restored = window.confirm(copy.editor.restoreDraft(openedName));
            if (restored) packageToEdit = draft;
            else removeDraft(localStorage, draftKey);
          }
        } catch {
          setMessage(copy.editor.draftCheckFailed);
        }
      }
      setGamePackage(packageToEdit);
      setFilePath(openedFilePath);
      setDriveFileId(openedDriveFileId);
      setFileName(openedName);
      setSaveStatus(restored ? 'pending' : 'saved');
      setHasPackage(true);
      setSelectedIndex(0);
      setShowValidation(false);
      return packageToEdit;
    },
    [copy],
  );

  const { recentPackages, refreshRecentPackages, rememberBrowserPackage } =
    useEditorRecents({
      drive,
      driveConnected,
      driveReady,
      onDriveFailure,
    });

  useEditorOpening({
    copy,
    fileName,
    hasPackage,
    selectedIndex,
    initialDeepLink,
    initialDeepLinkedQuestion,
    initialDesktopSession,
    applyOpenedPackage,
    refreshRecentPackages,
    rememberBrowserPackage,
    drive,
    driveConnected,
    driveFileId,
    driveReady,
    onDriveFailure,
    setDesktopSessionReady,
    setMessage,
    setSelectedIndex,
  });
  const saveCurrentPackage = useEditorPersistence({
    copy,
    currentPackage,
    desktopSessionReady,
    drive,
    driveConnected,
    driveFileId,
    fileName,
    filePath,
    gamePackage,
    hasPackage,
    locale,
    manageDocumentTitle,
    saveQueue,
    saveStatus,
    selectedIndex,
    clearDraft,
    onDriveFailure,
    setMessage,
    setSaveStatus,
  });
  const questions = useQuestionActions({
    copy,
    gamePackage,
    selectedIndex,
    textOptions,
    setGamePackage,
    setMessage,
    setSaveStatus,
    setSelectedIndex,
  });
  const packages = usePackageActions({
    copy,
    drive,
    driveConnected,
    driveFileId,
    fileName,
    gamePackage,
    saveStatus,
    applyOpenedPackage,
    clearDraft,
    createLocalizedPackage,
    refreshRecentPackages,
    rememberBrowserPackage,
    saveCurrentPackage,
    onDriveFailure,
    setFileName,
    setFilePath,
    setDriveFileId,
    setGamePackage,
    setHasPackage,
    setMessage,
    setSaveStatus,
    setSelectedIndex,
    setShowValidation,
  });

  return (
    <EditorView
      gamePackage={gamePackage}
      hasPackage={hasPackage}
      message={message}
      recentPackages={recentPackages}
      saveStatus={saveStatus}
      selectedIndex={selectedIndex}
      showValidation={showValidation}
      onAddHandout={questions.addHandout}
      onAnswerBlur={questions.correctMainAnswer}
      onAnswerCommentBlur={questions.correctAnswerComment}
      onAlternativeAnswerBlur={questions.correctAlternativeAnswer}
      onWrongAnswerBlur={questions.correctWrongAnswer}
      onBack={() => void packages.closePackage()}
      onCopyQuestion={() => void questions.copyQuestion()}
      onCreatePackage={() => void packages.createPackage()}
      onOpenPackage={(file) => void packages.openPackage(file)}
      onOpenRecentPackage={(recent) => void packages.openRecentPackage(recent)}
      onPasteQuestion={() => void questions.pasteQuestion()}
      onQuestionChange={questions.updateQuestion}
      onQuestionTextBlur={questions.correctQuestionText}
      onSelectQuestion={setSelectedIndex}
      onSwapQuestions={questions.swapQuestionPositions}
      onTitleChange={(title) => {
        setGamePackage({ ...gamePackage, title });
        setSaveStatus('pending');
        setMessage('');
      }}
    />
  );
}

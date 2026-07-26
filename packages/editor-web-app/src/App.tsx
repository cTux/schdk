import {
  createEmptyGamePackage,
  MAX_MUSIC_BREAK_BYTES,
  parseGamePackage,
  type GamePackage,
} from '@schdk/common';
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
import type {} from './electron';
import { useEditorOpening } from './use-editor-opening';
import { useEditorPersistence } from './use-editor-persistence';
import { useEditorRecents } from './use-editor-recents';
import { usePackageActions } from './use-package-actions';
import { useQuestionActions } from './use-question-actions';
import type { AppProps } from './types';

export type { AppProps } from './types';

export function App({
  aiGeneration,
  drive,
  driveActive = false,
  manageDocumentTitle = true,
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
  const [fileName, setFileName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>('saved');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [message, setMessage] = useState('');
  currentPackage.current = gamePackage;

  const applyOpenedPackage = useCallback(
    (content: Uint8Array, openedName: string, openedDriveFileId: string) => {
      const packageToEdit = parseGamePackage(content);
      setGamePackage(packageToEdit);
      setDriveFileId(openedDriveFileId);
      setFileName(openedName);
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
  const saveCurrentPackage = useEditorPersistence({
    copy,
    currentPackage,
    desktopSessionReady,
    drive,
    driveActive,
    driveFileId,
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
    setFileName,
    setMessage,
    setSaveStatus,
  });
  const questions = useQuestionActions({
    confirm,
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
    confirm,
    copy,
    drive,
    driveFileId,
    saveStatus,
    applyOpenedPackage,
    createLocalizedPackage,
    refreshRecentPackages,
    saveCurrentPackage,
    onDriveFailure,
    setFileName,
    setDriveFileId,
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
        aiGeneration={aiGeneration}
        gamePackage={gamePackage}
        hasPackage={hasPackage}
        message={message}
        openingRecentPackageId={packages.openingRecentPackageId}
        recentPackages={recentPackages}
        recentPackagesLoading={recentPackagesLoading}
        saveStatus={saveStatus}
        selectedIndex={selectedIndex}
        showValidation={showValidation}
        onAddHandout={questions.addHandout}
        onMusicBreakChange={(index, file) => {
          if (!file) {
            setGamePackage((current) => ({
              ...current,
              musicBreaks: current.musicBreaks.map((musicBreak, breakIndex) =>
                breakIndex === index ? null : musicBreak,
              ) as GamePackage['musicBreaks'],
            }));
            setSaveStatus('pending');
            setMessage('');
            return;
          }
          if (
            file.size > MAX_MUSIC_BREAK_BYTES ||
            !file.type.startsWith('audio/') ||
            !new Audio().canPlayType(file.type)
          ) {
            setMessage(copy.editor.invalidMusic);
            return;
          }
          void file
            .arrayBuffer()
            .then((buffer) => {
              setGamePackage((current) => ({
                ...current,
                musicBreaks: current.musicBreaks.map(
                  (musicBreak, breakIndex) =>
                    breakIndex === index
                      ? {
                          name: file.name,
                          mimeType: file.type,
                          data: new Uint8Array(buffer),
                        }
                      : musicBreak,
                ) as GamePackage['musicBreaks'],
              }));
              setSaveStatus('pending');
              setMessage('');
            })
            .catch(() => setMessage(copy.editor.invalidMusic));
        }}
        onAnswerBlur={questions.correctMainAnswer}
        onAnswerCommentBlur={questions.correctAnswerComment}
        onAlternativeAnswerBlur={questions.correctAlternativeAnswer}
        onWrongAnswerBlur={questions.correctWrongAnswer}
        onBack={() => void packages.closePackage()}
        onCopyQuestion={() => void questions.copyQuestion()}
        onCreatePackage={() => void packages.createPackage()}
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
        onQuestionTextBlur={questions.correctQuestionText}
        onSelectQuestion={setSelectedIndex}
        onSwapQuestions={questions.swapQuestionPositions}
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

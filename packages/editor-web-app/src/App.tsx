import {
  createEmptyGamePackage,
  parseGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  EditorView,
  type EditorSaveStatus,
  type RecentPackageItem,
} from '@schdk/ui/editor';
import { useLocalization } from '@schdk/ui/localization';
import {
  DEFAULT_EDITOR_TEXT_OPTIONS,
  type EditorTextOptions,
} from '@schdk/ui/options';
import { useCallback, useRef, useState } from 'react';
import {
  getDeepLinkedPackageName,
  getDeepLinkedQuestionIndex,
} from './deep-link';
import {
  loadDesktopEditorSession,
  loadDesktopRecentMetadata,
} from './desktop-session';
import { loadDraft, removeDraft } from './draft-storage';
import type {} from './electron';
import { listRecentWebPackages, rememberWebPackage } from './recent-packages';
import { useEditorOpening } from './use-editor-opening';
import { useEditorPersistence } from './use-editor-persistence';
import { usePackageActions } from './use-package-actions';
import { useQuestionActions } from './use-question-actions';

interface AppProps {
  manageDocumentTitle?: boolean;
  textOptions?: EditorTextOptions;
}

export function App({
  manageDocumentTitle = true,
  textOptions = DEFAULT_EDITOR_TEXT_OPTIONS,
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
  const [fileName, setFileName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>('saved');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [message, setMessage] = useState('');
  const [recentPackages, setRecentPackages] = useState<RecentPackageItem[]>([]);
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

  const refreshRecentPackages = useCallback(async () => {
    try {
      if (!window.desktop) {
        setRecentPackages(await listRecentWebPackages());
        return;
      }
      const recent = await window.desktop.listRecentGamePackages();
      const metadata = loadDesktopRecentMetadata(
        localStorage,
        window.location.pathname,
      );
      setRecentPackages(
        recent.map(({ filePath: id, fileName: name }) => ({
          id,
          name,
          ...(metadata[id]
            ? {
                title: metadata[id].title,
                ...(metadata[id].ready === undefined
                  ? {}
                  : { ready: metadata[id].ready }),
              }
            : {}),
        })),
      );
    } catch {
      setRecentPackages([]);
    }
  }, []);

  const applyOpenedPackage = useCallback(
    (
      content: Uint8Array,
      openedFilePath: string | null,
      openedName: string,
    ) => {
      const parsedPackage = parseGamePackage(content);
      let packageToEdit = parsedPackage;
      let restored = false;
      try {
        const draft = loadDraft(localStorage, openedName);
        if (draft) {
          restored = window.confirm(copy.editor.restoreDraft(openedName));
          if (restored) packageToEdit = draft;
          else removeDraft(localStorage, openedName);
        }
      } catch {
        setMessage(copy.editor.draftCheckFailed);
      }
      setGamePackage(packageToEdit);
      setFilePath(openedFilePath);
      setFileName(openedName);
      setSaveStatus(restored ? 'pending' : 'saved');
      setHasPackage(true);
      setSelectedIndex(0);
      setShowValidation(false);
      return packageToEdit;
    },
    [copy],
  );

  const rememberBrowserPackage = useCallback(
    async (name: string, title: string, content: Uint8Array) => {
      try {
        await rememberWebPackage(name, title, content);
        await refreshRecentPackages();
      } catch {
        // IndexedDB is optional; opening and saving still work without recents.
      }
    },
    [refreshRecentPackages],
  );

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
    setDesktopSessionReady,
    setMessage,
    setSelectedIndex,
  });
  const saveCurrentPackage = useEditorPersistence({
    copy,
    currentPackage,
    desktopSessionReady,
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
    fileName,
    gamePackage,
    saveStatus,
    applyOpenedPackage,
    clearDraft,
    createLocalizedPackage,
    refreshRecentPackages,
    rememberBrowserPackage,
    saveCurrentPackage,
    setFileName,
    setFilePath,
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

import {
  createEmptyGamePackage,
  parseGameQuestion,
  parseGamePackage,
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
  type GameQuestion,
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
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  saveStatusAfterWrite,
  scheduleAutosave,
  shouldScheduleAutosave,
} from './autosave';
import { saveWithPicker } from './browser-save';
import {
  getDeepLinkedPackageName,
  getDeepLinkedQuestionIndex,
  getPackageDeepLink,
  getQuestionDeepLink,
} from './deep-link';
import {
  loadDesktopRecentMetadata,
  loadDesktopEditorSession,
  saveDesktopRecentMetadata,
  saveDesktopEditorSession,
} from './desktop-session';
import { loadDraft, removeDraft, saveDraft } from './draft-storage';
import { createPackageFilename } from './package-filename';
import { getSelectedIndexAfterSwap, swapQuestions } from './question-order';
import {
  listRecentWebPackages,
  loadRecentWebPackage,
  rememberWebPackage,
} from './recent-packages';
import type {} from './electron';
import { correctAnswer, correctSentence } from './text-correction';

interface BrowserSaveResult {
  name: string;
  content: Uint8Array;
}

function replaceBrowserPackageDeepLink(
  packageName: string | null,
  selectedIndex?: number,
) {
  if (window.desktop) return;
  let deepLink = getPackageDeepLink(window.location.href, packageName);
  if (packageName && selectedIndex !== undefined) {
    deepLink = getQuestionDeepLink(deepLink, selectedIndex);
  }
  window.history.replaceState(window.history.state, '', deepLink);
}

interface AppProps {
  manageDocumentTitle?: boolean;
  textOptions?: EditorTextOptions;
}

export function App({
  manageDocumentTitle = true,
  textOptions = DEFAULT_EDITOR_TEXT_OPTIONS,
}: AppProps = {}) {
  const { copy, locale } = useLocalization();
  function createLocalizedPackage() {
    return { ...createEmptyGamePackage(), title: copy.shared.untitled };
  }
  const [gamePackage, setGamePackage] = useState<GamePackage>(() =>
    createLocalizedPackage(),
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
      if (window.desktop) {
        const recent = await window.desktop.listRecentGamePackages();
        const metadata = loadDesktopRecentMetadata(
          localStorage,
          window.location.pathname,
        );
        setRecentPackages(
          recent.map(({ filePath: id, fileName: name }) => {
            const recentMetadata = metadata[id];
            return {
              id,
              name,
              ...(recentMetadata
                ? {
                    title: recentMetadata.title,
                    ...(recentMetadata.ready !== undefined
                      ? { ready: recentMetadata.ready }
                      : {}),
                  }
                : {}),
            };
          }),
        );
      } else {
        setRecentPackages(await listRecentWebPackages());
      }
    } catch {
      setRecentPackages([]);
    }
  }, []);

  const applyOpenedPackage = useCallback(
    (
      content: Uint8Array,
      openedFilePath: string | null,
      openedFileName: string,
    ) => {
      const parsedPackage = parseGamePackage(content);
      let packageToEdit = parsedPackage;
      let restored = false;
      try {
        const draft = loadDraft(localStorage, openedFileName);
        if (draft) {
          restored = window.confirm(copy.editor.restoreDraft(openedFileName));
          if (restored) packageToEdit = draft;
          else removeDraft(localStorage, openedFileName);
        }
      } catch {
        setMessage(copy.editor.draftCheckFailed);
      }

      setGamePackage(packageToEdit);
      setFilePath(openedFilePath);
      setFileName(openedFileName);
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

  useEffect(() => {
    if (!hasPackage) void refreshRecentPackages();
  }, [hasPackage, refreshRecentPackages]);

  useEffect(() => {
    const packageName = initialDeepLink.current;
    if (!packageName) return;
    initialDeepLink.current = null;

    void (async () => {
      try {
        const content = await loadRecentWebPackage(packageName);
        if (!content) throw new Error('Deep-linked package is unavailable');
        const openedPackage = applyOpenedPackage(content, null, packageName);
        setSelectedIndex(initialDeepLinkedQuestion.current ?? 0);
        await rememberBrowserPackage(packageName, openedPackage.title, content);
      } catch {
        replaceBrowserPackageDeepLink(null);
        setMessage(copy.editor.deepLinkOpenFailed);
      }
    })();
  }, [applyOpenedPackage, copy, rememberBrowserPackage]);

  useEffect(() => {
    if (!window.desktop && hasPackage && fileName) {
      replaceBrowserPackageDeepLink(fileName, selectedIndex);
    }
  }, [fileName, hasPackage, selectedIndex]);

  useEffect(() => {
    const desktop = window.desktop;
    const session = initialDesktopSession.current;
    if (!desktop || !session) return;
    initialDesktopSession.current = null;

    void (async () => {
      try {
        const opened = await desktop.openRecentGamePackage(session.filePath);
        applyOpenedPackage(opened.content, opened.filePath, opened.fileName);
        setSelectedIndex(session.selectedIndex);
      } catch {
        saveDesktopEditorSession(localStorage, window.location.pathname, null);
        setMessage(copy.editor.restoreFileFailed);
      } finally {
        setDesktopSessionReady(true);
      }
    })();
  }, [applyOpenedPackage, copy]);

  useEffect(() => {
    if (!window.desktop || !desktopSessionReady) return;
    saveDesktopEditorSession(
      localStorage,
      window.location.pathname,
      filePath ? { filePath, selectedIndex } : null,
    );
  }, [desktopSessionReady, filePath, selectedIndex]);

  useEffect(() => {
    if (!window.desktop || !filePath) return;
    saveDesktopRecentMetadata(
      localStorage,
      window.location.pathname,
      filePath,
      {
        title: gamePackage.title,
        ready: validateGamePackage(gamePackage).length === 0,
      },
    );
  }, [filePath, gamePackage]);

  const saveCurrentPackage = useCallback(async () => {
    const desktop = window.desktop;
    if (!filePath || !desktop) return;

    const content = serializeGamePackage(gamePackage);
    setSaveStatus('saving');
    const save = saveQueue.current
      .catch(() => undefined)
      .then(() => desktop.writeGamePackage(filePath, content));
    saveQueue.current = save;
    try {
      await save;
      const isLatest = gamePackage === currentPackage.current;
      setSaveStatus(saveStatusAfterWrite(isLatest));
      if (isLatest && fileName) clearDraft(fileName);
    } catch (error) {
      setSaveStatus('error');
      throw error;
    }
  }, [clearDraft, fileName, filePath, gamePackage]);

  useEffect(() => {
    if (!hasPackage || !fileName || saveStatus !== 'pending') return;

    try {
      saveDraft(localStorage, fileName, gamePackage);
    } catch {
      setMessage(copy.editor.draftSaveFailed);
    }
  }, [copy, fileName, gamePackage, hasPackage, saveStatus]);

  useEffect(() => {
    if (
      !shouldScheduleAutosave(saveStatus, Boolean(filePath && window.desktop))
    )
      return;

    return scheduleAutosave(async () => {
      try {
        await saveCurrentPackage();
      } catch {
        setMessage(copy.editor.autoSaveFailed);
      }
    });
  }, [copy, filePath, saveCurrentPackage, saveStatus]);

  useEffect(
    () =>
      window.desktop?.onCloseRequested(async (attempt) => {
        try {
          await saveCurrentPackage();
          window.desktop!.finishCloseAttempt(attempt, true);
        } catch {
          setMessage(copy.editor.autoSaveFailed);
          window.desktop!.finishCloseAttempt(attempt, false);
        }
      }),
    [copy, saveCurrentPackage],
  );

  useEffect(() => {
    if (!manageDocumentTitle) return;
    document.documentElement.lang = locale;
    document.title = copy.meta.editorTitle(fileName);
  }, [copy, fileName, locale, manageDocumentTitle]);

  function updateQuestion(change: Partial<GameQuestion>) {
    setGamePackage((current) => ({
      ...current,
      questions: current.questions.map((item, index) =>
        index === selectedIndex ? { ...item, ...change } : item,
      ),
    }));
    setSaveStatus('pending');
    setMessage('');
  }

  function correctQuestionText() {
    if (!textOptions.correctQuestionText) return;
    const value = gamePackage.questions[selectedIndex]!.question;
    const corrected = correctSentence(value);
    if (corrected !== value) updateQuestion({ question: corrected });
  }

  function correctMainAnswer() {
    if (!textOptions.correctAnswers) return;
    const value = gamePackage.questions[selectedIndex]!.answer;
    const corrected = correctAnswer(value);
    if (corrected !== value) updateQuestion({ answer: corrected });
  }

  function correctAlternativeAnswer(index: number) {
    if (!textOptions.correctAnswers) return;
    const answers = gamePackage.questions[selectedIndex]!.alternativeAnswers;
    const corrected = correctAnswer(answers[index] ?? '');
    if (corrected === answers[index]) return;
    updateQuestion({
      alternativeAnswers: answers.map((answer, answerIndex) =>
        answerIndex === index ? corrected : answer,
      ),
    });
  }

  function correctAnswerComment() {
    if (!textOptions.correctAnswerComment) return;
    const value = gamePackage.questions[selectedIndex]!.answerComment ?? '';
    const corrected = correctSentence(value);
    if (corrected !== value) updateQuestion({ answerComment: corrected });
  }

  async function copyQuestion() {
    setMessage('');
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(gamePackage.questions[selectedIndex], null, 2),
      );
    } catch {
      setMessage(copy.editor.copyFailed);
    }
  }

  async function pasteQuestion() {
    if (!window.confirm(copy.editor.confirmPaste(selectedIndex + 1))) return;

    setMessage('');
    try {
      const question = parseGameQuestion(
        JSON.parse(await navigator.clipboard.readText()),
      );
      setGamePackage((current) => ({
        ...current,
        questions: current.questions.map((item, index) =>
          index === selectedIndex ? question : item,
        ),
      }));
      setSaveStatus('pending');
    } catch {
      setMessage(copy.editor.pasteFailed);
    }
  }

  function swapQuestionPositions(sourceIndex: number, targetIndex: number) {
    setGamePackage((current) => ({
      ...current,
      questions: swapQuestions(current.questions, sourceIndex, targetIndex),
    }));
    setSelectedIndex((current) =>
      getSelectedIndexAfterSwap(current, sourceIndex, targetIndex),
    );
    setSaveStatus('pending');
    setMessage('');
  }

  function addHandout(file: File) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') return;
      updateQuestion({
        handout: {
          kind: 'image',
          name: file.name,
          mimeType: file.type,
          dataUrl: reader.result,
        },
      });
    });
    reader.readAsDataURL(file);
  }

  async function openPackage(file: File) {
    setMessage('');
    try {
      const opened = window.desktop
        ? await window.desktop.openGamePackage(file)
        : {
            filePath: null,
            content: new Uint8Array(await file.arrayBuffer()),
          };
      const openedPackage = applyOpenedPackage(
        opened.content,
        opened.filePath,
        file.name,
      );
      if (!window.desktop) {
        await rememberBrowserPackage(
          file.name,
          openedPackage.title,
          opened.content,
        );
        replaceBrowserPackageDeepLink(file.name, 0);
      }
    } catch {
      setMessage(copy.editor.invalidFile);
    }
  }

  async function openRecentPackage(recent: RecentPackageItem) {
    setMessage('');
    try {
      if (window.desktop) {
        const opened = await window.desktop.openRecentGamePackage(recent.id);
        applyOpenedPackage(opened.content, opened.filePath, opened.fileName);
      } else {
        const content = await loadRecentWebPackage(recent.id);
        if (!content) throw new Error('Recent package is unavailable');
        const openedPackage = applyOpenedPackage(content, null, recent.name);
        await rememberBrowserPackage(recent.name, openedPackage.title, content);
        replaceBrowserPackageDeepLink(recent.name, 0);
      }
      await refreshRecentPackages();
    } catch {
      setMessage(copy.editor.recentOpenFailed);
      await refreshRecentPackages();
    }
  }

  async function createPackageFile(
    packageToSave: GamePackage,
  ): Promise<boolean> {
    setMessage('');
    const filename = createPackageFilename(
      packageToSave.title,
      new Date(),
      copy.editor.unfinishedGame,
    );

    try {
      if (window.desktop) {
        const content = serializeGamePackage(packageToSave);
        const savedPath = await window.desktop.saveGamePackage(
          filename,
          content,
        );
        if (!savedPath) return false;
        setFilePath(savedPath);
        const pathParts = savedPath.split(/[\\/]/u);
        setFileName(pathParts[pathParts.length - 1] || filename);
        setSaveStatus('saved');
        return true;
      }

      const saved = await savePackageInBrowser(packageToSave, filename);
      if (!saved) return false;
      setFileName(saved.name);
      setSaveStatus('saved');
      await rememberBrowserPackage(
        saved.name,
        packageToSave.title,
        saved.content,
      );
      replaceBrowserPackageDeepLink(saved.name, 0);
      return true;
    } catch {
      setMessage(copy.editor.saveFailed);
      return false;
    }
  }

  async function savePackageInBrowser(
    packageToSave: GamePackage,
    suggestedName: string,
  ): Promise<BrowserSaveResult | null> {
    const content = serializeGamePackage(packageToSave);
    if (window.showSaveFilePicker) {
      const name = await saveWithPicker(
        window.showSaveFilePicker.bind(window),
        suggestedName,
        content,
        copy.editor.filePickerDescription,
      );
      return name ? { name, content } : null;
    }

    const url = URL.createObjectURL(
      new Blob([new Uint8Array(content)], { type: 'application/zip' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = suggestedName;
    link.click();
    URL.revokeObjectURL(url);
    return { name: suggestedName, content };
  }

  async function createPackage() {
    const emptyPackage = createLocalizedPackage();
    if (!(await createPackageFile(emptyPackage))) return;

    setGamePackage(emptyPackage);
    setHasPackage(true);
    setSelectedIndex(0);
    setShowValidation(false);
  }

  async function closePackage() {
    try {
      if (window.desktop) {
        await saveCurrentPackage();
      } else if (saveStatus !== 'saved') {
        const oldFileName = fileName;
        const saved = await savePackageInBrowser(
          gamePackage,
          createPackageFilename(
            gamePackage.title,
            new Date(),
            copy.editor.unfinishedGame,
          ),
        );
        if (!saved) return;
        await rememberBrowserPackage(
          saved.name,
          gamePackage.title,
          saved.content,
        );
        if (oldFileName) clearDraft(oldFileName);
        if (saved.name !== oldFileName) clearDraft(saved.name);
      }
      setGamePackage(createLocalizedPackage());
      setHasPackage(false);
      setFilePath(null);
      setFileName(null);
      setSaveStatus('saved');
      setSelectedIndex(0);
      setShowValidation(false);
      setMessage('');
      replaceBrowserPackageDeepLink(null);
    } catch {
      setMessage(copy.editor.autoSaveFailed);
    }
  }

  return (
    <EditorView
      gamePackage={gamePackage}
      hasPackage={hasPackage}
      message={message}
      recentPackages={recentPackages}
      saveStatus={saveStatus}
      selectedIndex={selectedIndex}
      showValidation={showValidation}
      onAddHandout={addHandout}
      onAnswerBlur={correctMainAnswer}
      onAnswerCommentBlur={correctAnswerComment}
      onAlternativeAnswerBlur={correctAlternativeAnswer}
      onBack={() => void closePackage()}
      onCopyQuestion={() => void copyQuestion()}
      onCreatePackage={() => void createPackage()}
      onOpenPackage={(file) => void openPackage(file)}
      onOpenRecentPackage={(recent) => void openRecentPackage(recent)}
      onPasteQuestion={() => void pasteQuestion()}
      onQuestionChange={updateQuestion}
      onQuestionTextBlur={correctQuestionText}
      onSelectQuestion={setSelectedIndex}
      onSwapQuestions={swapQuestionPositions}
      onTitleChange={(title) => {
        setGamePackage({ ...gamePackage, title });
        setSaveStatus('pending');
        setMessage('');
      }}
    />
  );
}

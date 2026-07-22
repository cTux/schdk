import {
  createEmptyGamePackage,
  parseGamePackage,
  serializeGamePackage,
  type GamePackage,
  type GameQuestion,
} from '@schdk/common';
import {
  EditorView,
  type EditorSaveStatus,
  type RecentPackageItem,
} from '@schdk/ui/editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  saveStatusAfterWrite,
  scheduleAutosave,
  shouldScheduleAutosave,
} from './autosave';
import { saveWithPicker } from './browser-save';
import { loadDraft, removeDraft, saveDraft } from './draft-storage';
import { createPackageFilename } from './package-filename';
import {
  listRecentWebPackages,
  loadRecentWebPackage,
  rememberWebPackage,
} from './recent-packages';

interface BrowserSaveResult {
  name: string;
  content: Uint8Array;
}

export function App() {
  const [gamePackage, setGamePackage] = useState<GamePackage>(
    createEmptyGamePackage,
  );
  const currentPackage = useRef(gamePackage);
  const saveQueue = useRef(Promise.resolve());
  const [hasPackage, setHasPackage] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>('saved');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [message, setMessage] = useState('');
  const [recentPackages, setRecentPackages] = useState<RecentPackageItem[]>([]);
  currentPackage.current = gamePackage;

  const clearDraft = useCallback((name: string) => {
    try {
      removeDraft(localStorage, name);
    } catch {
      setMessage('Файл збережено, але аварійну копію не вдалося видалити.');
    }
  }, []);

  const refreshRecentPackages = useCallback(async () => {
    try {
      if (window.desktop) {
        const recent = await window.desktop.listRecentGamePackages();
        setRecentPackages(
          recent.map(({ filePath: id, fileName: name }) => ({ id, name })),
        );
      } else {
        setRecentPackages(await listRecentWebPackages());
      }
    } catch {
      setRecentPackages([]);
    }
  }, []);

  useEffect(() => {
    if (!hasPackage) void refreshRecentPackages();
  }, [hasPackage, refreshRecentPackages]);

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
      setMessage('Не вдалося створити аварійну копію в браузері.');
    }
  }, [fileName, gamePackage, hasPackage, saveStatus]);

  useEffect(() => {
    if (
      !shouldScheduleAutosave(saveStatus, Boolean(filePath && window.desktop))
    )
      return;

    return scheduleAutosave(async () => {
      try {
        await saveCurrentPackage();
      } catch {
        setMessage('Не вдалося автоматично зберегти файл.');
      }
    });
  }, [filePath, saveCurrentPackage, saveStatus]);

  useEffect(
    () =>
      window.desktop?.onCloseRequested(async (attempt) => {
        try {
          await saveCurrentPackage();
          window.desktop!.finishCloseAttempt(attempt, true);
        } catch {
          setMessage('Не вдалося автоматично зберегти файл.');
          window.desktop!.finishCloseAttempt(attempt, false);
        }
      }),
    [saveCurrentPackage],
  );

  useEffect(() => {
    if (!window.desktop) return;
    document.title = fileName
      ? `${fileName} — SCHDK Editor`
      : 'Що? Де? Коли? — Редактор';
  }, [fileName]);

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

  function addHandout(file: File) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') return;
      updateQuestion({
        handout: {
          name: file.name,
          mimeType: file.type,
          dataUrl: reader.result,
        },
      });
    });
    reader.readAsDataURL(file);
  }

  function applyOpenedPackage(
    content: Uint8Array,
    openedFilePath: string | null,
    openedFileName: string,
  ) {
    const parsedPackage = parseGamePackage(content);
    let packageToEdit = parsedPackage;
    let restored = false;
    try {
      const draft = loadDraft(localStorage, openedFileName);
      if (draft) {
        restored = window.confirm(
          `Знайдено незбережену версію пакета «${openedFileName}». Відновити її?`,
        );
        if (restored) packageToEdit = draft;
        else removeDraft(localStorage, openedFileName);
      }
    } catch {
      setMessage('Не вдалося перевірити аварійну копію в браузері.');
    }

    setGamePackage(packageToEdit);
    setFilePath(openedFilePath);
    setFileName(openedFileName);
    setSaveStatus(restored ? 'pending' : 'saved');
    setHasPackage(true);
    setSelectedIndex(0);
    setShowValidation(false);
  }

  async function rememberBrowserPackage(name: string, content: Uint8Array) {
    try {
      await rememberWebPackage(name, content);
      await refreshRecentPackages();
    } catch {
      // IndexedDB is optional; opening and saving still work without recents.
    }
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
      applyOpenedPackage(opened.content, opened.filePath, file.name);
      if (!window.desktop) {
        await rememberBrowserPackage(file.name, opened.content);
      }
    } catch {
      setMessage('Не вдалося відкрити файл: неправильний формат.');
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
        applyOpenedPackage(content, null, recent.name);
        await rememberBrowserPackage(recent.name, content);
      }
      await refreshRecentPackages();
    } catch {
      setMessage(
        'Не вдалося відкрити недавній файл. Можливо, його переміщено або видалено.',
      );
      await refreshRecentPackages();
    }
  }

  async function createPackageFile(
    packageToSave: GamePackage,
  ): Promise<boolean> {
    setMessage('');
    const filename = createPackageFilename(packageToSave.title);

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
      await rememberBrowserPackage(saved.name, saved.content);
      return true;
    } catch {
      setMessage('Не вдалося зберегти файл.');
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
    const emptyPackage = createEmptyGamePackage();
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
          createPackageFilename(gamePackage.title),
        );
        if (!saved) return;
        await rememberBrowserPackage(saved.name, saved.content);
        if (oldFileName) clearDraft(oldFileName);
        if (saved.name !== oldFileName) clearDraft(saved.name);
      }
      setGamePackage(createEmptyGamePackage());
      setHasPackage(false);
      setFilePath(null);
      setFileName(null);
      setSaveStatus('saved');
      setSelectedIndex(0);
      setShowValidation(false);
      setMessage('');
    } catch {
      setMessage('Не вдалося автоматично зберегти файл.');
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
      onBack={() => void closePackage()}
      onCreatePackage={() => void createPackage()}
      onOpenPackage={(file) => void openPackage(file)}
      onOpenRecentPackage={(recent) => void openRecentPackage(recent)}
      onQuestionChange={updateQuestion}
      onSelectQuestion={setSelectedIndex}
      onTitleChange={(title) => {
        setGamePackage({ ...gamePackage, title });
        setSaveStatus('pending');
        setMessage('');
      }}
    />
  );
}

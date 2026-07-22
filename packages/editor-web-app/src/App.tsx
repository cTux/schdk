import {
  QUESTION_COUNT,
  QUESTIONS_PER_ROUND,
  createEmptyGamePackage,
  parseGamePackage,
  serializeGamePackage,
  type GamePackage,
  type GameQuestion,
} from '@schdk/common';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
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
  type RecentPackage,
} from './recent-packages';

const SAVE_STATUS_LABELS = {
  saved: 'Файл збережено',
  pending: 'Очікує збереження',
  saving: 'Файл зберігається…',
  error: 'Не вдалося зберегти файл',
} as const;

type SaveStatus = keyof typeof SAVE_STATUS_LABELS;

interface BrowserSaveResult {
  name: string;
  content: Uint8Array;
}

export function App() {
  const openFileInput = useRef<HTMLInputElement>(null);
  const [gamePackage, setGamePackage] = useState<GamePackage>(
    createEmptyGamePackage,
  );
  const currentPackage = useRef(gamePackage);
  const saveQueue = useRef(Promise.resolve());
  const [hasPackage, setHasPackage] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [message, setMessage] = useState('');
  const [recentPackages, setRecentPackages] = useState<RecentPackage[]>([]);
  const question = gamePackage.questions[selectedIndex]!;
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
          recent.map(({ filePath, fileName }) => ({
            id: filePath,
            name: fileName,
          })),
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

  function updateAlternative(index: number, value: string) {
    updateQuestion({
      alternativeAnswers: question.alternativeAnswers.map(
        (answer, answerIndex) => (answerIndex === index ? value : answer),
      ),
    });
  }

  function addAlternative() {
    updateQuestion({
      alternativeAnswers: [...question.alternativeAnswers, ''],
    });
  }

  function removeAlternative(index: number) {
    updateQuestion({
      alternativeAnswers: question.alternativeAnswers.filter(
        (_, answerIndex) => answerIndex !== index,
      ),
    });
  }

  function addHandout(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

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
    event.target.value = '';
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
      // IndexedDB is an optional browser convenience; opening and saving still work.
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

  async function openRecentPackage(recent: RecentPackage) {
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

  function selectPackage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    void openPackage(file);
    event.target.value = '';
  }

  function dropPackage(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) void openPackage(file);
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
    <main>
      <header className="app-header">
        <div className="brand">
          {hasPackage && (
            <button
              className="back-button"
              type="button"
              onClick={() => void closePackage()}
              aria-label="Назад"
              title="Назад"
            >
              ←
            </button>
          )}
          <img className="app-icon" src="./owl.svg" alt="" />
          <div>
            <p className="eyebrow">Редактор пакетів</p>
            <h1>Що? Де? Коли?</h1>
          </div>
        </div>
        {hasPackage && (
          <div className="package-header">
            <label className="package-title">
              Назва пакета
              <input
                className={
                  showValidation && !gamePackage.title.trim() ? 'invalid' : ''
                }
                value={gamePackage.title}
                onChange={(event) => {
                  setGamePackage({ ...gamePackage, title: event.target.value });
                  setSaveStatus('pending');
                  setMessage('');
                }}
                placeholder="Наприклад, Весняна гра 2026"
                aria-invalid={showValidation && !gamePackage.title.trim()}
              />
            </label>
            <p className={`save-status ${saveStatus}`} role="status">
              <span className="save-status-dot" aria-hidden="true" />
              {SAVE_STATUS_LABELS[saveStatus]}
            </p>
          </div>
        )}
      </header>

      <section
        className="package-drop-zone"
        hidden={hasPackage}
        onDragOver={(event) => event.preventDefault()}
        onDrop={dropPackage}
      >
        <h2>Відкрийте пакет</h2>
        <p>Перетягніть сюди файл .schdk</p>
        <div className="drop-actions">
          <button type="button" onClick={() => openFileInput.current?.click()}>
            Вибрати файл
          </button>
          <span>або</span>
          <button className="primary" type="button" onClick={createPackage}>
            Новий пакет
          </button>
        </div>
        {recentPackages.length > 0 && (
          <div className="recent-packages">
            <h3>Недавні пакети</h3>
            <div className="recent-package-list">
              {recentPackages.map((recent) => (
                <button
                  key={recent.id}
                  type="button"
                  onClick={() => void openRecentPackage(recent)}
                  title={recent.name}
                >
                  <span className="recent-package-icon" aria-hidden="true">
                    ◫
                  </span>
                  <span>{recent.name}</span>
                  <span className="recent-package-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              ))}
            </div>
            {!window.desktop && (
              <p className="recent-package-note">
                Вебверсія відкриває останню збережену локальну копію.
              </p>
            )}
          </div>
        )}
      </section>

      <input
        ref={openFileInput}
        className="open-file-input"
        type="file"
        accept=".schdk"
        onChange={selectPackage}
      />

      <div className="editor-layout" hidden={!hasPackage}>
        <nav className="question-list" aria-label="Питання пакета">
          {[0, 1, 2].map((round) => (
            <section key={round}>
              <h2>Раунд {round + 1}</h2>
              <div className="question-grid">
                {Array.from({ length: QUESTIONS_PER_ROUND }, (_, offset) => {
                  const index = round * QUESTIONS_PER_ROUND + offset;
                  const item = gamePackage.questions[index]!;
                  const valid = Boolean(
                    item.question.trim() &&
                    item.answer.trim() &&
                    !item.comment?.trim(),
                  );
                  const invalid = showValidation && !valid;
                  return (
                    <button
                      className={[
                        index === selectedIndex ? 'selected' : '',
                        valid ? 'complete' : '',
                        invalid ? 'invalid' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      key={index}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      aria-label={`Питання ${index + 1}`}
                      aria-invalid={invalid}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <section className="question-editor">
          <div className="question-heading">
            <h2>Питання {selectedIndex + 1}</h2>
          </div>

          <label>
            Текст питання
            <textarea
              className={
                showValidation && !question.question.trim() ? 'invalid' : ''
              }
              rows={7}
              value={question.question}
              onChange={(event) =>
                updateQuestion({ question: event.target.value })
              }
              aria-invalid={showValidation && !question.question.trim()}
            />
          </label>

          <label>
            Відповідь
            <textarea
              className={
                showValidation && !question.answer.trim() ? 'invalid' : ''
              }
              rows={3}
              value={question.answer}
              onChange={(event) =>
                updateQuestion({ answer: event.target.value })
              }
              aria-invalid={showValidation && !question.answer.trim()}
            />
          </label>

          <fieldset>
            <legend>
              Альтернативні відповіді <span>(необов'язково)</span>
            </legend>
            {question.alternativeAnswers.map((answer, index) => (
              <div className="alternative" key={index}>
                <input
                  value={answer}
                  onChange={(event) =>
                    updateAlternative(index, event.target.value)
                  }
                  aria-label={`Альтернативна відповідь ${index + 1}`}
                />
                <button type="button" onClick={() => removeAlternative(index)}>
                  Видалити
                </button>
              </div>
            ))}
            <button
              className="secondary"
              type="button"
              onClick={addAlternative}
            >
              + Додати відповідь
            </button>
          </fieldset>

          <fieldset>
            <legend>
              Роздатка <span>(необов'язково)</span>
            </legend>
            {question.handout ? (
              <div className="handout-preview">
                <img src={question.handout.dataUrl} alt="Роздатка до питання" />
                <div>
                  <span>{question.handout.name}</span>
                  <button
                    type="button"
                    onClick={() => updateQuestion({ handout: undefined })}
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ) : (
              <label className="file-button">
                Додати зображення
                <input type="file" accept="image/*" onChange={addHandout} />
              </label>
            )}
          </fieldset>

          <fieldset>
            <legend>
              Коментар{' '}
              <span>(питання не готове, доки коментар не вирішено)</span>
            </legend>
            <label>
              Коментар до питання
              <textarea
                className={
                  showValidation && question.comment?.trim() ? 'invalid' : ''
                }
                rows={3}
                value={question.comment ?? ''}
                onChange={(event) =>
                  updateQuestion({ comment: event.target.value })
                }
                aria-invalid={Boolean(
                  showValidation && question.comment?.trim(),
                )}
              />
            </label>
            {question.comment?.trim() && (
              <button
                className="secondary"
                type="button"
                onClick={() => updateQuestion({ comment: undefined })}
              >
                Вирішено
              </button>
            )}
          </fieldset>

          <fieldset>
            <legend>
              Примітки для ведучого <span>(необов'язково)</span>
            </legend>
            <label>
              Host-примітки
              <textarea
                rows={3}
                value={question.hostNotes ?? ''}
                onChange={(event) =>
                  updateQuestion({ hostNotes: event.target.value })
                }
              />
            </label>
          </fieldset>

          <div className="question-actions">
            <button
              type="button"
              disabled={selectedIndex === 0}
              onClick={() => setSelectedIndex(selectedIndex - 1)}
            >
              ← Попереднє
            </button>
            <button
              type="button"
              disabled={selectedIndex === QUESTION_COUNT - 1}
              onClick={() => setSelectedIndex(selectedIndex + 1)}
            >
              Наступне →
            </button>
          </div>
        </section>
      </div>

      {message && (
        <p className="status" role="status">
          {message}
        </p>
      )}
    </main>
  );
}

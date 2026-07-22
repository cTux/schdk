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

const SAVE_STATUS_LABELS = {
  saved: 'Файл збережено',
  pending: 'Очікує збереження',
  saving: 'Файл зберігається…',
  error: 'Не вдалося зберегти файл',
} as const;

type SaveStatus = keyof typeof SAVE_STATUS_LABELS;

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
  const question = gamePackage.questions[selectedIndex]!;
  currentPackage.current = gamePackage;

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
      setSaveStatus(
        saveStatusAfterWrite(gamePackage === currentPackage.current),
      );
    } catch (error) {
      setSaveStatus('error');
      throw error;
    }
  }, [filePath, gamePackage]);

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

  async function openPackage(file: File) {
    setMessage('');
    try {
      const opened = window.desktop
        ? await window.desktop.openGamePackage(file)
        : {
            filePath: null,
            content: new Uint8Array(await file.arrayBuffer()),
          };
      const parsedPackage = parseGamePackage(opened.content);
      setGamePackage(parsedPackage);
      setFilePath(opened.filePath);
      setFileName(file.name);
      setSaveStatus('saved');
      setHasPackage(true);
      setSelectedIndex(0);
      setShowValidation(false);
    } catch {
      setMessage('Не вдалося відкрити файл: неправильний формат.');
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

    const content = serializeGamePackage(packageToSave);
    const safeTitle =
      packageToSave.title.replace(/[\p{Cc}<>:"/\\|?*]/gu, '-').trim() ||
      'Незавершена гра';
    const filename = `${safeTitle}.schdk`;

    try {
      if (window.desktop) {
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

      const url = URL.createObjectURL(
        new Blob([new Uint8Array(content)], { type: 'application/zip' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      setFileName(filename);
      setSaveStatus('saved');
      return true;
    } catch {
      setMessage('Не вдалося зберегти файл.');
      return false;
    }
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
      await saveCurrentPackage();
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

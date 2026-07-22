import {
  QUESTION_COUNT,
  QUESTIONS_PER_ROUND,
  createEmptyGamePackage,
  parseGamePackage,
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
  type GameQuestion,
} from '@schdk/common';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { scheduleAutosave } from './autosave';

export function App() {
  const openFileInput = useRef<HTMLInputElement>(null);
  const [gamePackage, setGamePackage] = useState<GamePackage>(
    createEmptyGamePackage,
  );
  const [hasPackage, setHasPackage] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [message, setMessage] = useState('');
  const question = gamePackage.questions[selectedIndex]!;

  useEffect(() => {
    if (!dirty || !filePath || !window.desktop) return;

    return scheduleAutosave(() => {
      void window
        .desktop!.writeGamePackage(filePath, serializeGamePackage(gamePackage))
        .catch(() => setMessage('Не вдалося автоматично зберегти файл.'));
    });
  }, [dirty, filePath, gamePackage]);

  function updateQuestion(change: Partial<GameQuestion>) {
    setGamePackage((current) => ({
      ...current,
      questions: current.questions.map((item, index) =>
        index === selectedIndex ? { ...item, ...change } : item,
      ),
    }));
    setDirty(true);
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
        : { filePath: null, content: await file.text() };
      setGamePackage(parseGamePackage(opened.content));
      setFilePath(opened.filePath);
      setHasPackage(true);
      setDirty(false);
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

  async function savePackage(
    finished: boolean,
    packageToSave = gamePackage,
  ): Promise<boolean> {
    setMessage('');

    if (finished) {
      setShowValidation(true);
      const errors = validateGamePackage(packageToSave);
      if (errors.length) {
        setMessage(`${errors[0]} Помилок: ${errors.length}.`);
        return false;
      }
    }

    const content = serializeGamePackage(packageToSave);
    const safeTitle =
      packageToSave.title.replace(/[\p{Cc}<>:"/\\|?*]/gu, '-').trim() ||
      'Незавершена гра';
    const filename = `${safeTitle}.${finished ? 'schdk' : 'schdk-draft'}`;

    try {
      if (window.desktop) {
        const savedPath = await window.desktop.saveGamePackage(
          filename,
          content,
        );
        if (!savedPath) return false;
        setFilePath(savedPath);
        setDirty(false);
        return true;
      }

      const url = URL.createObjectURL(
        new Blob([content], { type: 'application/json;charset=utf-8' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch {
      setMessage('Не вдалося зберегти файл.');
      return false;
    }
  }

  async function createPackage() {
    const emptyPackage = createEmptyGamePackage();
    if (!(await savePackage(false, emptyPackage))) return;

    setGamePackage(emptyPackage);
    setHasPackage(true);
    setSelectedIndex(0);
    setShowValidation(false);
  }

  return (
    <main>
      <header className="app-header">
        <div className="brand">
          <img className="app-icon" src="./owl.svg" alt="" />
          <div>
            <p className="eyebrow">Редактор пакетів</p>
            <h1>Що? Де? Коли?</h1>
          </div>
        </div>
        {hasPackage && (
          <div className="save-area">
            <button
              type="button"
              onClick={() => openFileInput.current?.click()}
            >
              Відкрити
            </button>
            <button type="button" onClick={() => savePackage(false)}>
              Зберегти чернетку
            </button>
            <button
              className="primary"
              type="button"
              onClick={() => savePackage(true)}
            >
              Зберегти готовий пакет
            </button>
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
        <p>Перетягніть сюди файл .schdk або .schdk-draft</p>
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
        accept=".schdk,.schdk-draft"
        onChange={selectPackage}
      />

      <label className="package-title" hidden={!hasPackage}>
        Назва пакета
        <input
          className={
            showValidation && !gamePackage.title.trim() ? 'invalid' : ''
          }
          value={gamePackage.title}
          onChange={(event) => {
            setGamePackage({ ...gamePackage, title: event.target.value });
            setDirty(true);
            setMessage('');
          }}
          placeholder="Наприклад, Весняна гра 2026"
          aria-invalid={showValidation && !gamePackage.title.trim()}
        />
      </label>

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

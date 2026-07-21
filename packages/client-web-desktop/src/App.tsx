import {
  QUESTION_COUNT,
  QUESTIONS_PER_ROUND,
  createEmptyGamePackage,
  parseGamePackage,
  requiredQuestionKind,
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
  type GameQuestion,
} from '@schdk/common';
import { useRef, useState, type ChangeEvent } from 'react';

const kindLabels = {
  general: 'Звичайне питання',
  football: 'Футбольне питання',
  music: 'Музичне питання',
} as const;

export function App() {
  const openFileInput = useRef<HTMLInputElement>(null);
  const [gamePackage, setGamePackage] = useState<GamePackage>(
    createEmptyGamePackage,
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [message, setMessage] = useState('');
  const question = gamePackage.questions[selectedIndex]!;
  function updateQuestion(change: Partial<GameQuestion>) {
    setGamePackage((current) => ({
      ...current,
      questions: current.questions.map((item, index) =>
        index === selectedIndex ? { ...item, ...change } : item,
      ),
    }));
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

  async function openPackage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setGamePackage(parseGamePackage(await file.text()));
      setSelectedIndex(0);
      setShowValidation(false);
      setMessage('Файл відкрито.');
    } catch {
      setMessage('Не вдалося відкрити файл: неправильний формат.');
    } finally {
      event.target.value = '';
    }
  }

  async function savePackage(finished: boolean) {
    if (finished) {
      setShowValidation(true);
      const errors = validateGamePackage(gamePackage);
      if (errors.length) {
        setMessage(`${errors[0]} Помилок: ${errors.length}.`);
        return;
      }
    }

    const content = serializeGamePackage(gamePackage);
    const safeTitle =
      gamePackage.title.replace(/[\p{Cc}<>:"/\\|?*]/gu, '-').trim() ||
      'Незавершена гра';
    const filename = `${safeTitle}.${finished ? 'schdk' : 'schdk-draft'}`;

    if (window.desktop) {
      const saved = await window.desktop.saveGamePackage(filename, content);
      setMessage(
        saved
          ? finished
            ? 'Пакет збережено.'
            : 'Чернетку збережено.'
          : 'Збереження скасовано.',
      );
      return;
    }

    const url = URL.createObjectURL(
      new Blob([content], { type: 'application/json;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setMessage(finished ? 'Пакет завантажено.' : 'Чернетку завантажено.');
  }

  return (
    <main>
      <header className="app-header">
        <div>
          <p className="eyebrow">Редактор пакетів</p>
          <h1>Що? Де? Коли?</h1>
        </div>
        <div className="save-area">
          <button type="button" onClick={() => openFileInput.current?.click()}>
            Відкрити
          </button>
          <input
            ref={openFileInput}
            className="open-file-input"
            type="file"
            accept=".schdk,.schdk-draft"
            onChange={openPackage}
          />
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
      </header>

      <label className="package-title">
        Назва пакета
        <input
          className={
            showValidation && !gamePackage.title.trim() ? 'invalid' : ''
          }
          value={gamePackage.title}
          onChange={(event) => {
            setGamePackage({ ...gamePackage, title: event.target.value });
            setMessage('');
          }}
          placeholder="Наприклад, Весняна гра 2026"
          aria-invalid={showValidation && !gamePackage.title.trim()}
        />
      </label>

      <div className="editor-layout">
        <nav className="question-list" aria-label="Питання пакета">
          {[0, 1, 2].map((round) => (
            <section key={round}>
              <h2>Раунд {round + 1}</h2>
              <div className="question-grid">
                {Array.from({ length: QUESTIONS_PER_ROUND }, (_, offset) => {
                  const index = round * QUESTIONS_PER_ROUND + offset;
                  const item = gamePackage.questions[index]!;
                  const special = requiredQuestionKind(index) !== 'general';
                  const valid = Boolean(
                    item.question.trim() &&
                    item.answer.trim() &&
                    item.kind === requiredQuestionKind(index),
                  );
                  const invalid = showValidation && !valid;
                  return (
                    <button
                      className={[
                        index === selectedIndex ? 'selected' : '',
                        valid ? 'complete' : '',
                        special ? 'special' : '',
                        invalid ? 'invalid' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      key={index}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      aria-label={`Питання ${index + 1}: ${kindLabels[item.kind]}`}
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
            <div>
              <p className="eyebrow">Питання {selectedIndex + 1}</p>
              <h2>{kindLabels[question.kind]}</h2>
            </div>
            {question.kind !== 'general' && (
              <span className="badge">Обов'язковий тип</span>
            )}
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

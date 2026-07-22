import { QUESTION_COUNT, type GameQuestion } from '@schdk/common';
import { Button } from '../atoms/Button';
import { FileButton } from '../atoms/FileButton';

interface QuestionEditorProps {
  question: GameQuestion;
  selectedIndex: number;
  showValidation: boolean;
  onAddHandout(file: File): void;
  onChange(change: Partial<GameQuestion>): void;
  onSelectQuestion(index: number): void;
}

export function QuestionEditor({
  question,
  selectedIndex,
  showValidation,
  onAddHandout,
  onChange,
  onSelectQuestion,
}: QuestionEditorProps) {
  function updateAlternative(index: number, value: string) {
    onChange({
      alternativeAnswers: question.alternativeAnswers.map(
        (answer, answerIndex) => (answerIndex === index ? value : answer),
      ),
    });
  }

  function removeAlternative(index: number) {
    onChange({
      alternativeAnswers: question.alternativeAnswers.filter(
        (_, answerIndex) => answerIndex !== index,
      ),
    });
  }

  return (
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
          onChange={(event) => onChange({ question: event.target.value })}
          aria-invalid={showValidation && !question.question.trim()}
        />
      </label>

      <label>
        Відповідь
        <textarea
          className={showValidation && !question.answer.trim() ? 'invalid' : ''}
          rows={3}
          value={question.answer}
          onChange={(event) => onChange({ answer: event.target.value })}
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
              onChange={(event) => updateAlternative(index, event.target.value)}
              aria-label={`Альтернативна відповідь ${index + 1}`}
            />
            <Button type="button" onClick={() => removeAlternative(index)}>
              Видалити
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          type="button"
          onClick={() =>
            onChange({
              alternativeAnswers: [...question.alternativeAnswers, ''],
            })
          }
        >
          + Додати відповідь
        </Button>
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
              <Button
                type="button"
                onClick={() => onChange({ handout: undefined })}
              >
                Видалити
              </Button>
            </div>
          </div>
        ) : (
          <FileButton
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onAddHandout(file);
              event.target.value = '';
            }}
          >
            Додати зображення
          </FileButton>
        )}
      </fieldset>

      <fieldset>
        <legend>
          Коментар <span>(питання не готове, доки коментар не вирішено)</span>
        </legend>
        <label>
          Коментар до питання
          <textarea
            className={
              showValidation && question.comment?.trim() ? 'invalid' : ''
            }
            rows={3}
            value={question.comment ?? ''}
            onChange={(event) => onChange({ comment: event.target.value })}
            aria-invalid={Boolean(showValidation && question.comment?.trim())}
          />
        </label>
        {question.comment?.trim() && (
          <Button
            variant="secondary"
            type="button"
            onClick={() => onChange({ comment: undefined })}
          >
            Вирішено
          </Button>
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
            onChange={(event) => onChange({ hostNotes: event.target.value })}
          />
        </label>
      </fieldset>

      <div className="question-actions">
        <Button
          type="button"
          disabled={selectedIndex === 0}
          onClick={() => onSelectQuestion(selectedIndex - 1)}
        >
          ← Попереднє
        </Button>
        <Button
          type="button"
          disabled={selectedIndex === QUESTION_COUNT - 1}
          onClick={() => onSelectQuestion(selectedIndex + 1)}
        >
          Наступне →
        </Button>
      </div>
    </section>
  );
}

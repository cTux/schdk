import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../atoms/Button';

interface AlternativeAnswersFieldProps {
  answers: string[];
  onChange(answers: string[]): void;
}

export function AlternativeAnswersField({
  answers,
  onChange,
}: AlternativeAnswersFieldProps) {
  return (
    <fieldset>
      <legend>
        Альтернативні відповіді <span>(необов'язково)</span>
      </legend>
      {answers.map((answer, index) => (
        <div className="alternative" key={index}>
          <input
            value={answer}
            onChange={(event) =>
              onChange(
                answers.map((item, answerIndex) =>
                  answerIndex === index ? event.target.value : item,
                ),
              )
            }
            aria-label={`Альтернативна відповідь ${index + 1}`}
          />
          <Button
            type="button"
            onClick={() =>
              onChange(
                answers.filter((_, answerIndex) => answerIndex !== index),
              )
            }
          >
            Видалити
          </Button>
        </div>
      ))}
      <Button
        variant="secondary"
        type="button"
        onClick={() => onChange([...answers, ''])}
      >
        <FontAwesomeIcon icon={faPlus} aria-hidden="true" /> Додати відповідь
      </Button>
    </fieldset>
  );
}

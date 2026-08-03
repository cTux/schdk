import './styles.scss';

import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { useLocalization } from '../../localization';
import { type AnswerListFieldProps } from './answer-list-field-props';

function AnswerListField({
  answers,
  answerLabel,
  legend,
  onChange,
  onBlur,
}: AnswerListFieldProps) {
  const { copy } = useLocalization();

  return (
    <fieldset
      className="answer-list"
      data-empty={answers.length === 0}
      aria-label={`${legend} ${copy.shared.optional}`}
    >
      <legend className="answer-list-heading">
        <span className="answer-list-label">
          <strong>{legend}</strong> {copy.shared.optional}
        </span>
        <Button
          className="answer-list-add"
          variant="secondary"
          type="button"
          onClick={() => onChange([...answers, ''])}
        >
          <FontAwesomeIcon icon={faPlus} aria-hidden="true" />{' '}
          {copy.editor.addAnswer}
        </Button>
      </legend>
      {answers.map((answer, index) => (
        <div className="alternative" key={index}>
          <Input
            value={answer}
            onChange={(event) =>
              onChange(
                answers.map((item, answerIndex) =>
                  answerIndex === index ? event.target.value : item,
                ),
              )
            }
            onBlur={() => onBlur(index)}
            aria-label={answerLabel(index + 1)}
          />
          <Button
            type="button"
            onClick={() =>
              onChange(
                answers.filter((_, answerIndex) => answerIndex !== index),
              )
            }
          >
            {copy.shared.remove}
          </Button>
        </div>
      ))}
    </fieldset>
  );
}

export { type AnswerListFieldProps, AnswerListField };

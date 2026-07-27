import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { useLocalization } from '../../localization';

export interface AnswerListFieldProps {
  answers: string[];
  answerLabel(number: number): string;
  legend: string;
  onChange(answers: string[]): void;
  onBlur(index: number): void;
}

export function AnswerListField({
  answers,
  answerLabel,
  legend,
  onChange,
  onBlur,
}: AnswerListFieldProps) {
  const { copy } = useLocalization();

  return (
    <fieldset>
      <legend>
        {legend} <span>{copy.shared.optional}</span>
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
      <Button
        variant="secondary"
        type="button"
        onClick={() => onChange([...answers, ''])}
      >
        <FontAwesomeIcon icon={faPlus} aria-hidden="true" />{' '}
        {copy.editor.addAnswer}
      </Button>
    </fieldset>
  );
}

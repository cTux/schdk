import './styles.scss';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';

export interface AlternativeAnswersFieldProps {
  answers: string[];
  onChange(answers: string[]): void;
  onBlur(index: number): void;
}

export function AlternativeAnswersField({
  answers,
  onChange,
  onBlur,
}: AlternativeAnswersFieldProps) {
  const { copy } = useLocalization();

  return (
    <fieldset>
      <legend>
        {copy.editor.alternativeAnswers} <span>{copy.shared.optional}</span>
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
            onBlur={() => onBlur(index)}
            aria-label={copy.editor.alternativeAnswer(index + 1)}
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

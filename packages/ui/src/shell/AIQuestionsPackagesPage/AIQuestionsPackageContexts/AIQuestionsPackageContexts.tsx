import { QUESTION_COUNT } from '@schdk/common';
import { Button } from '../../../atoms/Button';
import { Dropdown } from '../../../atoms/Dropdown';
import { TextAreaField } from '../../../atoms/TextAreaField';
import { useLocalization } from '../../../localization';
import type { AIQuestionsPackageContextsProps } from './types';

export function AIQuestionsPackageContexts({
  disabled,
  questionRules,
  value,
  onChange,
}: AIQuestionsPackageContextsProps) {
  const { copy } = useLocalization();
  const update = (index: number, change: Partial<(typeof value)[number]>) =>
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...change } : item,
      ),
    );

  return (
    <fieldset className="ai-package-contexts">
      <legend>{copy.aiPackageRules.additionalContexts}</legend>
      {value.map((question, index) => (
        <div className="ai-package-context" key={index}>
          <label>
            {copy.aiPackageRules.questionNumber}
            <Dropdown
              disabled={disabled}
              value={String(question.questionNumber)}
              onChange={(event) =>
                update(index, { questionNumber: Number(event.target.value) })
              }
            >
              {Array.from({ length: QUESTION_COUNT }, (_, itemIndex) => (
                <option key={itemIndex} value={itemIndex + 1}>
                  {itemIndex + 1}
                </option>
              ))}
            </Dropdown>
          </label>
          <label>
            {copy.aiPackageRules.questionType}
            <Dropdown
              disabled={disabled}
              value={question.questionType ?? ''}
              onChange={(event) =>
                update(index, {
                  questionType: event.target.value || undefined,
                })
              }
            >
              <option value="">{copy.shared.optional}</option>
              {questionRules.map((rule) => (
                <option key={rule.name} value={rule.name}>
                  {rule.name}
                </option>
              ))}
            </Dropdown>
          </label>
          <TextAreaField
            required
            disabled={disabled}
            rows={4}
            label={copy.aiPackageRules.questionContext}
            value={question.context}
            onValueChange={(context) => update(index, { context })}
          />
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() =>
              onChange(value.filter((_, itemIndex) => itemIndex !== index))
            }
          >
            {copy.shared.remove}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => onChange([...value, { questionNumber: 1, context: '' }])}
      >
        {copy.aiPackageRules.addQuestionContext}
      </Button>
    </fieldset>
  );
}

import '../styles.scss';

import { compareFavoriteItemsByName, QUESTION_COUNT } from '@schdk/common';
import { Button } from '../../../atoms/Button';
import { Dropdown } from '../../../atoms/Dropdown';
import { Input } from '../../../atoms/Input';
import { useLocalization } from '../../../localization';
import type { AIQuestionsPackageContextsProps } from './types';

export function AIQuestionsPackageContexts({
  disabled,
  questionRules,
  value,
  onChange,
}: AIQuestionsPackageContextsProps) {
  const { copy } = useLocalization();
  const sortedQuestionRules = [...questionRules].sort(
    compareFavoriteItemsByName,
  );
  const sortedQuestions = value
    .map((question, index) => ({ question, index }))
    .sort(
      (left, right) =>
        left.question.questionNumber - right.question.questionNumber,
    );
  const nextQuestionNumber = Array.from(
    { length: QUESTION_COUNT },
    (_, index) => index + 1,
  ).find(
    (questionNumber) =>
      !value.some((question) => question.questionNumber === questionNumber),
  );
  const change = (questions: typeof value) =>
    onChange(
      [...questions].sort(
        (left, right) => left.questionNumber - right.questionNumber,
      ),
    );
  const update = (index: number, patch: Partial<(typeof value)[number]>) =>
    change(
      value.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );

  return (
    <fieldset className="ai-package-contexts">
      <legend>{copy.aiPackageRules.additionalContexts}</legend>
      {sortedQuestions.map(({ question, index }) => (
        <div className="ai-package-context" key={index}>
          <label className="ai-package-context-number">
            {copy.aiPackageRules.questionNumber}
            <Dropdown
              disabled={disabled}
              value={String(question.questionNumber)}
              onChange={(event) =>
                update(index, { questionNumber: Number(event.target.value) })
              }
            >
              {Array.from({ length: QUESTION_COUNT }, (_, itemIndex) => (
                <option
                  key={itemIndex}
                  value={itemIndex + 1}
                  disabled={value.some(
                    (item, itemIndexToCompare) =>
                      itemIndexToCompare !== index &&
                      item.questionNumber === itemIndex + 1,
                  )}
                >
                  {itemIndex + 1}
                </option>
              ))}
            </Dropdown>
          </label>
          <label className="ai-package-context-type">
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
              {sortedQuestionRules.map((rule) => (
                <option key={rule.name} value={rule.name}>
                  {rule.favorite ? '⭐ ' : ''}
                  {rule.name}
                </option>
              ))}
            </Dropdown>
          </label>
          <label className="ai-package-context-text">
            {copy.aiPackageRules.questionContext}
            <Input
              required
              disabled={disabled}
              value={question.context}
              onChange={(event) =>
                update(index, { context: event.target.value })
              }
            />
          </label>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() =>
              change(value.filter((_, itemIndex) => itemIndex !== index))
            }
          >
            {copy.shared.remove}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || nextQuestionNumber === undefined}
        onClick={() =>
          nextQuestionNumber !== undefined &&
          change([
            ...value,
            { questionNumber: nextQuestionNumber, context: '' },
          ])
        }
      >
        {copy.aiPackageRules.addQuestionContext}
      </Button>
    </fieldset>
  );
}

import './styles.scss';

import classNames from 'classnames';
import { Button } from '../../atoms/Button';
import { LOCALIZATION_COPY } from '../../localization';
import { QuestionTooltip } from '../QuestionTooltip';
import { type QuestionListButtonProps } from './question-list-button-props';
import { getQuestionListItem } from './get-question-list-item';

function QuestionListButton({
  copy = LOCALIZATION_COPY.uk,
  dragging,
  dropTarget,
  duplicate = false,
  index,
  question,
  selected,
  showTooltip,
  showValidation,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDragStart,
  onDrop,
  onSelect,
}: QuestionListButtonProps) {
  const item = getQuestionListItem(question, showValidation);
  const tooltipId = `question-tooltip-${index}`;
  const hasTooltip = showTooltip && item.hasPreview;

  return (
    <Button
      className={classNames({
        selected,
        complete: item.complete,
        generated: Boolean(question.aiGeneration),
        invalid: duplicate || item.invalid,
        remark: item.remark,
        dragging,
        'drop-target': dropTarget,
      })}
      type="button"
      draggable
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      aria-label={copy.shared.questionNumber(index + 1)}
      aria-describedby={hasTooltip ? tooltipId : undefined}
      aria-invalid={duplicate || item.invalid}
    >
      <span>{index + 1}</span>
      {hasTooltip && (
        <QuestionTooltip
          answer={item.answer}
          copy={copy}
          hasSummary={item.hasSummary}
          id={tooltipId}
          question={item.questionText}
          remark={item.remark}
        />
      )}
    </Button>
  );
}

export {
  getQuestionListItem,
  type QuestionListButtonProps,
  QuestionListButton,
};

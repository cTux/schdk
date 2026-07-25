import type { GameQuestion } from '@schdk/common';
import classNames from 'classnames';
import type { DragEvent } from 'react';
import { Button } from '../../atoms/Button';
import { LOCALIZATION_COPY, type LocalizationCopy } from '../../localization';
import { QuestionTooltip } from '../QuestionTooltip';

export function getQuestionListItem(
  question: GameQuestion,
  showValidation: boolean,
) {
  const questionText = question.question.trim();
  const answer = question.answer.trim();
  const remark = question.comment?.trim() ?? '';
  const hasSummary = Boolean(questionText && answer);
  const complete = hasSummary && !remark;

  return {
    answer,
    complete,
    hasPreview: hasSummary || Boolean(remark),
    hasSummary,
    invalid: showValidation && !complete,
    questionText,
    remark,
  };
}

export interface QuestionListButtonProps {
  copy?: LocalizationCopy;
  dragging: boolean;
  dropTarget: boolean;
  index: number;
  question: GameQuestion;
  selected: boolean;
  showTooltip: boolean;
  showValidation: boolean;
  onDragEnd(): void;
  onDragEnter(): void;
  onDragOver(event: DragEvent<HTMLButtonElement>): void;
  onDragStart(event: DragEvent<HTMLButtonElement>): void;
  onDrop(event: DragEvent<HTMLButtonElement>): void;
  onSelect(): void;
}

export function QuestionListButton({
  copy = LOCALIZATION_COPY.uk,
  dragging,
  dropTarget,
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
        invalid: item.invalid,
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
      aria-invalid={item.invalid}
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

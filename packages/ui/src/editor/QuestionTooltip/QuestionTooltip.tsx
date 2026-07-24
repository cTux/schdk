import './styles.scss';

import classNames from 'classnames';

export interface QuestionTooltipProps {
  answer: string;
  hasSummary: boolean;
  id: string;
  question: string;
  remark: string;
}

export function QuestionTooltip({
  answer,
  hasSummary,
  id,
  question,
  remark,
}: QuestionTooltipProps) {
  return (
    <span className="question-tooltip" id={id} role="tooltip">
      {hasSummary && (
        <span className="question-tooltip-block">
          <strong>Питання</strong>
          <span>{question}</span>
        </span>
      )}
      {remark && (
        <span
          className={classNames(
            'question-tooltip-block',
            'question-tooltip-remark',
          )}
        >
          <strong>Зауваження</strong>
          <span>{remark}</span>
        </span>
      )}
      {hasSummary && (
        <span className="question-tooltip-block">
          <strong>Відповідь</strong>
          <span>{answer}</span>
        </span>
      )}
    </span>
  );
}

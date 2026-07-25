import './styles.scss';

import classNames from 'classnames';
import { LOCALIZATION_COPY, type LocalizationCopy } from '../../localization';

export interface QuestionTooltipProps {
  answer: string;
  copy?: LocalizationCopy;
  hasSummary: boolean;
  id: string;
  question: string;
  remark: string;
}

export function QuestionTooltip({
  answer,
  copy = LOCALIZATION_COPY.uk,
  hasSummary,
  id,
  question,
  remark,
}: QuestionTooltipProps) {
  return (
    <span className="question-tooltip" id={id} role="tooltip">
      {hasSummary && (
        <span className="question-tooltip-block">
          <strong>{copy.shared.question}</strong>
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
          <strong>{copy.editor.remark}</strong>
          <span>{remark}</span>
        </span>
      )}
      {hasSummary && (
        <span className="question-tooltip-block">
          <strong>{copy.shared.answer}</strong>
          <span>{answer}</span>
        </span>
      )}
    </span>
  );
}

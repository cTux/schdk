import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { QuestionTooltip } from '..';

describe('QuestionTooltip', () => {
  it('marks the remark block with both semantic classes', () => {
    const tooltip = QuestionTooltip({
      answer: '',
      hasSummary: false,
      id: 'tooltip',
      question: '',
      remark: 'Перевірити джерело',
    });
    const remark = (
      tooltip.props.children as ReactElement[]
    )[1] as ReactElement<{
      className: string;
    }>;

    expect(remark.props.className).toMatchInlineSnapshot(
      `"question-tooltip-block question-tooltip-remark"`,
    );
  });
});

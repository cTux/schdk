import { describe, expect, it } from 'vitest';
import { QuestionListButton } from '..';
import { getQuestionListItem } from '../QuestionListButton';

describe('question list items', () => {
  it('builds previews and remark states', () => {
    const complete = getQuestionListItem(
      {
        question: ' Питання ',
        answer: ' Відповідь ',
        alternativeAnswers: [],
      },
      false,
    );
    expect(complete).toMatchObject({
      questionText: 'Питання',
      answer: 'Відповідь',
      complete: true,
      hasPreview: true,
      hasSummary: true,
      remark: '',
    });

    const remarked = getQuestionListItem(
      {
        question: 'Питання',
        answer: 'Відповідь',
        alternativeAnswers: [],
        comment: ' Перевірити джерело ',
      },
      true,
    );
    expect(remarked).toMatchObject({
      complete: false,
      hasPreview: true,
      hasSummary: true,
      invalid: true,
      remark: 'Перевірити джерело',
    });
  });

  it('composes interaction and question-state classes', () => {
    const button = QuestionListButton({
      dragging: true,
      dropTarget: true,
      index: 0,
      question: {
        question: 'Питання',
        answer: 'Відповідь',
        alternativeAnswers: [],
      },
      selected: true,
      showTooltip: false,
      showValidation: true,
      onDragEnd: () => undefined,
      onDragEnter: () => undefined,
      onDragOver: () => undefined,
      onDragStart: () => undefined,
      onDrop: () => undefined,
      onSelect: () => undefined,
    });

    expect(button.props.className).toMatchInlineSnapshot(
      `"selected complete dragging drop-target"`,
    );
  });
});

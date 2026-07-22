import { describe, expect, it } from 'vitest';
import { getQuestionListItem } from './QuestionListButton';

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
});

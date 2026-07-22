import { describe, expect, it } from 'vitest';
import { getSelectedIndexAfterSwap, swapQuestions } from './question-order';

describe('question order', () => {
  it('swaps questions and keeps selection on the same question', () => {
    const questions = Array.from({ length: 18 }, (_, index) => ({
      question: `Question ${index + 1}`,
      answer: `Answer ${index + 1}`,
      alternativeAnswers: [],
    }));

    const swapped = swapQuestions(questions, 2, 17);

    expect(swapped[2]?.question).toBe('Question 18');
    expect(swapped[17]?.question).toBe('Question 3');
    expect(questions[2]?.question).toBe('Question 3');
    expect(getSelectedIndexAfterSwap(2, 2, 17)).toBe(17);
    expect(getSelectedIndexAfterSwap(17, 2, 17)).toBe(2);
    expect(getSelectedIndexAfterSwap(5, 2, 17)).toBe(5);
  });
});

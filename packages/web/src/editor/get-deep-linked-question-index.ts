import { QUESTION_COUNT } from '@schdk/common';
import { QUESTION_PARAMETER } from './question-parameter';

export function getDeepLinkedQuestionIndex(url: string): number | null {
  try {
    const question = Number(new URL(url).searchParams.get(QUESTION_PARAMETER));
    return Number.isSafeInteger(question) &&
      question >= 1 &&
      question <= QUESTION_COUNT
      ? question - 1
      : null;
  } catch {
    return null;
  }
}

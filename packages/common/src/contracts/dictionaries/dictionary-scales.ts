import { AI_QUESTION_DIFFICULTIES } from '../../constants/ai-questions/ai-question-difficulties.js';
import type { AIQuestionDifficulty } from '../ai-questions/ai-question.js';
import type { SchdkDictionary, SchdkDictionaryId } from './schdk-dictionary.js';

type ScaleCopy = Record<AIQuestionDifficulty, [string, string, string]>;

export function createScaleDictionary(
  id: SchdkDictionaryId,
  name: string,
  description: string,
  copy: ScaleCopy,
): SchdkDictionary {
  return {
    id,
    name,
    description,
    items: AI_QUESTION_DIFFICULTIES.map((value) => ({
      id: value,
      value,
      name: copy[value][0],
      description: copy[value][1],
      promptPart: copy[value][2],
    })),
  };
}

import { AI_QUESTION_DIFFICULTIES } from '../../constants/ai-questions/ai-question-difficulties.js';
import type {
  SchdkDictionary,
  SchdkDictionaryDistribution,
  SchdkDictionaryId,
} from './schdk-dictionary.js';

function createDistributionDictionary(
  id: SchdkDictionaryId,
  name: string,
  description: string,
  source: SchdkDictionary,
): SchdkDictionary {
  return {
    id,
    name,
    description,
    items: source.items.map((item) => ({
      id: item.value,
      value: item.value,
      name: `Повністю ${item.name.toLocaleLowerCase('uk')}`,
      description: `100% питань мають значення «${item.name.toLocaleLowerCase('uk')}».`,
      distribution: Object.fromEntries(
        AI_QUESTION_DIFFICULTIES.map((value) => [
          value,
          value === item.value ? 100 : 0,
        ]),
      ) as SchdkDictionaryDistribution,
    })),
  };
}

export { createDistributionDictionary };

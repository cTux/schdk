import { AI_QUESTION_DIFFICULTIES } from '@schdk/common';
import { Input } from '../../../atoms/Input';
import type { DictionaryDistributionFieldsProps as Props } from './types';

export function DictionaryDistributionFields({ item, onChange }: Props) {
  return (
    <div className="dictionary-distribution-fields">
      {AI_QUESTION_DIFFICULTIES.map((value) => (
        <label key={value}>
          {value}
          <Input
            type="number"
            min={0}
            max={100}
            value={item.distribution?.[value] ?? 0}
            onChange={(event) =>
              onChange(
                value,
                Math.min(100, Math.max(0, event.target.valueAsNumber || 0)),
              )
            }
          />
          %
        </label>
      ))}
    </div>
  );
}

import './styles.scss';
import { Checkbox } from '../../atoms/Checkbox';
import type { QuestionDatabaseCheckProps } from './types';

export function QuestionDatabaseCheck({
  checked,
  disabled,
  label,
  onChange,
}: QuestionDatabaseCheckProps) {
  return (
    <label className="question-generation-check">
      <Checkbox
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

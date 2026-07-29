import { Checkbox } from '../../atoms/Checkbox';
import { type OptionToggleProps } from './option-toggle-props';

function OptionToggle({
  checked,
  description,
  label,
  onChange,
}: OptionToggleProps) {
  return (
    <label className="option-toggle">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <Checkbox
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export { type OptionToggleProps, OptionToggle };

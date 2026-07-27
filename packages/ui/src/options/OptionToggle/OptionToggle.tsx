import { Checkbox } from '../../atoms/Checkbox';

export interface OptionToggleProps {
  checked: boolean;
  description: string;
  label: string;
  onChange(checked: boolean): void;
}

export function OptionToggle({
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

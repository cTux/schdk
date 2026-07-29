export interface OptionToggleProps {
  checked: boolean;
  description: string;
  label: string;
  onChange(checked: boolean): void;
}

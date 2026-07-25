export interface OptionSliderProps {
  description: string;
  label: string;
  value: number;
  onChange(value: number): void;
}

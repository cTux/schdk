import type { OptionSliderProps } from './types';

export function OptionSlider({
  description,
  label,
  value,
  onChange,
}: OptionSliderProps) {
  const percentage = Math.round(value * 100);

  return (
    <label className="option-slider">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
      />
      <output>{percentage}%</output>
    </label>
  );
}

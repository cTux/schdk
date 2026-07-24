import './styles.scss';

export interface PackageTitleFieldProps {
  invalid: boolean;
  value: string;
  onChange(value: string): void;
}

export function PackageTitleField({
  invalid,
  value,
  onChange,
}: PackageTitleFieldProps) {
  return (
    <label className="package-title">
      Назва пакета
      <input
        className={invalid ? 'invalid' : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Наприклад, Весняна гра 2026"
        aria-invalid={invalid}
      />
    </label>
  );
}

import { useLocalization } from '../../localization';

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
  const { copy } = useLocalization();

  return (
    <label className="package-title">
      {copy.editor.packageTitle}
      <input
        className={invalid ? 'invalid' : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={copy.editor.packageTitlePlaceholder}
        aria-invalid={invalid}
      />
    </label>
  );
}

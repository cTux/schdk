import { Input } from '../../atoms/Input';
import { useLocalization } from '../../localization';
import { type PackageTitleFieldProps } from './package-title-field-props';

function PackageTitleField({
  invalid,
  value,
  onChange,
}: PackageTitleFieldProps) {
  const { copy } = useLocalization();

  return (
    <label className="package-title">
      <Input
        aria-label={copy.editor.packageTitle}
        className={invalid ? 'invalid' : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={copy.editor.packageTitlePlaceholder}
        aria-invalid={invalid}
      />
    </label>
  );
}

export { type PackageTitleFieldProps, PackageTitleField };

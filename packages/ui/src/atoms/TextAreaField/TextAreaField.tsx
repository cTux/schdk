import classNames from 'classnames';
import { LOCALIZATION_COPY } from '../../localization';
import { Textarea, type TextareaProps } from '../Textarea';

export interface TextAreaFieldProps extends Omit<
  TextareaProps,
  'onChange' | 'value'
> {
  invalid?: boolean;
  label: string;
  optional?: boolean;
  optionalLabel?: string;
  value: string;
  onValueChange(value: string): void;
}

export function TextAreaField({
  invalid = false,
  label,
  optional = false,
  optionalLabel = LOCALIZATION_COPY.uk.shared.optional,
  className = '',
  value,
  onValueChange,
  ...props
}: TextAreaFieldProps) {
  return (
    <label>
      {label} {optional && <span>{optionalLabel}</span>}
      <Textarea
        {...props}
        className={classNames(className, { invalid }) || undefined}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-invalid={invalid}
      />
    </label>
  );
}

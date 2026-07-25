import classNames from 'classnames';
import type { TextareaHTMLAttributes } from 'react';
import { LOCALIZATION_COPY } from '../../localization';

export interface TextAreaFieldProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
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
      <textarea
        {...props}
        className={classNames(className, { invalid }) || undefined}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-invalid={invalid}
      />
    </label>
  );
}

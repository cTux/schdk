import type { TextareaHTMLAttributes } from 'react';

interface TextAreaFieldProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange' | 'value'
> {
  invalid?: boolean;
  label: string;
  optional?: boolean;
  value: string;
  onValueChange(value: string): void;
}

export function TextAreaField({
  invalid = false,
  label,
  optional = false,
  className = '',
  value,
  onValueChange,
  ...props
}: TextAreaFieldProps) {
  return (
    <label>
      {label} {optional && <span>(необов'язково)</span>}
      <textarea
        {...props}
        className={
          [className, invalid ? 'invalid' : ''].filter(Boolean).join(' ') ||
          undefined
        }
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-invalid={invalid}
      />
    </label>
  );
}

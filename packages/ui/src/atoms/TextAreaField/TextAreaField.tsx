import classNames from 'classnames';
import { LOCALIZATION_COPY } from '../../localization';
import { Textarea } from '../Textarea';
import { type TextAreaFieldProps } from './text-area-field-props';

function TextAreaField({
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

export { type TextAreaFieldProps, TextAreaField };

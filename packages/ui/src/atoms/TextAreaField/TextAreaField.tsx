import './styles.scss';

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
  const fieldLabel = optional ? `${label} ${optionalLabel}` : label;

  return (
    <label
      className={classNames('text-area-field', { 'has-value': Boolean(value) })}
    >
      {value && (
        <span className="text-area-field-label" aria-hidden="true">
          {fieldLabel}
        </span>
      )}
      <Textarea
        {...props}
        className={classNames(className, { invalid }) || undefined}
        placeholder={fieldLabel}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-label={fieldLabel}
        aria-invalid={invalid}
      />
    </label>
  );
}

export { type TextAreaFieldProps, TextAreaField };

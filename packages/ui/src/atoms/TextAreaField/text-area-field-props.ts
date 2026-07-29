import { type TextareaProps } from '../Textarea';

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

import './styles.scss';

import { TextAreaField } from '../../atoms/TextAreaField';

export interface HostNotesFieldProps {
  value: string;
  onChange(value: string): void;
}

export function HostNotesField({ value, onChange }: HostNotesFieldProps) {
  return (
    <fieldset>
      <legend>
        Примітки для ведучого <span>(необов'язково)</span>
      </legend>
      <TextAreaField
        label="Примітки ведучого"
        rows={3}
        value={value}
        onValueChange={onChange}
      />
    </fieldset>
  );
}

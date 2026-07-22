import { TextAreaField } from '../atoms/TextAreaField';

interface HostNotesFieldProps {
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
        label="Host-примітки"
        rows={3}
        value={value}
        onValueChange={onChange}
      />
    </fieldset>
  );
}

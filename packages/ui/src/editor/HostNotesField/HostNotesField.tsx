import './styles.scss';

import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';

export interface HostNotesFieldProps {
  value: string;
  onChange(value: string): void;
}

export function HostNotesField({ value, onChange }: HostNotesFieldProps) {
  const { copy } = useLocalization();

  return (
    <fieldset>
      <legend>
        {copy.editor.hostNotes} <span>{copy.shared.optional}</span>
      </legend>
      <TextAreaField
        label={copy.editor.hostNotesLabel}
        rows={3}
        value={value}
        onValueChange={onChange}
      />
    </fieldset>
  );
}

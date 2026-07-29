import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import { type HostNotesFieldProps } from './host-notes-field-props';

function HostNotesField({ value, onChange }: HostNotesFieldProps) {
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

export { type HostNotesFieldProps, HostNotesField };

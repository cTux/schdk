import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import { type HostNotesFieldProps } from './host-notes-field-props';

function HostNotesField({ value, onChange }: HostNotesFieldProps) {
  const { copy } = useLocalization();

  return (
    <TextAreaField
      label={copy.editor.hostNotesLabel}
      rows={3}
      value={value}
      onValueChange={onChange}
    />
  );
}

export { type HostNotesFieldProps, HostNotesField };

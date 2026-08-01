import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ActionToolbarButton } from '../../../../atoms/ActionToolbar';
import type { LocalizationCopy } from '../../../../localization';

interface ElementVisibilityButtonProps {
  copy: LocalizationCopy;
  hidden: boolean;
  onChange(hidden: boolean): void;
}

export function ElementVisibilityButton({
  copy,
  hidden,
  onChange,
}: ElementVisibilityButtonProps) {
  return (
    <ActionToolbarButton
      icon={hidden ? faEye : faEyeSlash}
      label={
        hidden ? copy.visualEditor.showInGame : copy.visualEditor.hideInGame
      }
      pressed={hidden}
      onClick={() => onChange(!hidden)}
    />
  );
}

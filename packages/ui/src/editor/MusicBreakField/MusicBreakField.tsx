import './styles.scss';

import { Button } from '../../atoms/Button';
import { FileButton } from '../../atoms/FileButton';
import { useLocalization } from '../../localization';
import type { MusicBreakFieldProps } from './types';

export function MusicBreakField({
  musicBreak,
  onChange,
}: MusicBreakFieldProps) {
  const { copy } = useLocalization();
  return (
    <div className="music-break-field">
      <strong>{copy.editor.musicBreak}</strong>
      {musicBreak && <span title={musicBreak.name}>{musicBreak.name}</span>}
      <div>
        <FileButton
          accept="audio/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onChange(file);
            event.target.value = '';
          }}
        >
          {musicBreak ? copy.editor.replaceMusic : copy.editor.addMusic}
        </FileButton>
        {musicBreak && (
          <Button type="button" variant="ghost" onClick={() => onChange(null)}>
            {copy.shared.remove}
          </Button>
        )}
      </div>
    </div>
  );
}

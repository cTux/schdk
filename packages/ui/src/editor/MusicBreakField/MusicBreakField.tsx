import './styles.scss';

import {
  faMusic,
  faPlus,
  faRotate,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FileButton } from '../../atoms/FileButton';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import type { MusicBreakFieldProps } from './types';

export function MusicBreakField({
  musicBreak,
  onChange,
}: MusicBreakFieldProps) {
  const { copy } = useLocalization();
  return (
    <div className="music-break-field">
      <div className="music-break-summary">
        <FontAwesomeIcon icon={faMusic} aria-hidden="true" />
        <span>
          <strong>{copy.editor.musicBreak}</strong>
          <small title={musicBreak?.name}>
            {musicBreak?.name ?? copy.editor.noMusic}
          </small>
        </span>
      </div>
      <div className="music-break-actions">
        <FileButton
          accept="audio/*"
          aria-label={
            musicBreak ? copy.editor.replaceMusic : copy.editor.addMusic
          }
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onChange(file);
            event.target.value = '';
          }}
        >
          <FontAwesomeIcon
            icon={musicBreak ? faRotate : faPlus}
            aria-hidden="true"
          />
          {musicBreak ? copy.editor.replaceMusic : copy.editor.addMusic}
        </FileButton>
        {musicBreak && (
          <IconButton
            icon={faTrashCan}
            label={copy.shared.remove}
            type="button"
            variant="ghost"
            onClick={() => onChange(null)}
          />
        )}
      </div>
    </div>
  );
}

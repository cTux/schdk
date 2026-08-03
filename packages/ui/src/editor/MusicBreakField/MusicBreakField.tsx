import './styles.scss';

import { faMusic } from '@fortawesome/free-solid-svg-icons/faMusic';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faRotate } from '@fortawesome/free-solid-svg-icons/faRotate';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import type { MusicBreakFieldProps } from './types';

export function MusicBreakField({
  musicBreak,
  onChange,
}: MusicBreakFieldProps) {
  const { copy } = useLocalization();
  const musicInput = useRef<HTMLInputElement>(null);
  const musicAction = musicBreak
    ? copy.editor.replaceMusic
    : copy.editor.addMusic;
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
        <IconButton
          icon={musicBreak ? faRotate : faPlus}
          label={musicAction}
          type="button"
          onClick={() => musicInput.current?.click()}
        />
        <input
          ref={musicInput}
          className="open-file-input"
          type="file"
          accept="audio/*"
          aria-label={musicAction}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onChange(file);
            event.target.value = '';
          }}
        />
        {musicBreak && (
          <IconButton
            className="music-break-remove"
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

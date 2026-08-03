import { faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons/faCircleHalfStroke';
import { ActionToolbarPopover } from '../../../atoms/ActionToolbar';
import { Dropdown } from '../../../atoms/Dropdown';
import {
  GAME_IMAGE_POSITIONS,
  type GameLayoutPosition,
} from '../../../options/types';
import type { PositionSettingsProps } from '../PositionSettings/types';

export function ImagePositionSettings({
  copy,
  position,
  selection,
  onUpdate,
}: PositionSettingsProps) {
  const labels = {
    'left top': copy.visualEditor.alignments.leftTop,
    'center top': copy.visualEditor.alignments.centerTop,
    'right top': copy.visualEditor.alignments.rightTop,
    'left center': copy.visualEditor.alignments.leftCenter,
    'center center': copy.visualEditor.alignments.centerCenter,
    'right center': copy.visualEditor.alignments.rightCenter,
    'left bottom': copy.visualEditor.alignments.leftBottom,
    'center bottom': copy.visualEditor.alignments.centerBottom,
    'right bottom': copy.visualEditor.alignments.rightBottom,
  };
  return (
    <ActionToolbarPopover
      icon={faCircleHalfStroke}
      label={copy.visualEditor.imagePosition}
    >
      <h2>{copy.visualEditor.imagePosition}</h2>
      <label>
        {copy.visualEditor.alignment}
        <Dropdown
          value={position.imagePosition}
          onChange={(event) =>
            onUpdate(selection, {
              imagePosition: event.target
                .value as GameLayoutPosition['imagePosition'],
            })
          }
        >
          {GAME_IMAGE_POSITIONS.map((name) => (
            <option key={name} value={name}>
              {labels[name]}
            </option>
          ))}
        </Dropdown>
      </label>
    </ActionToolbarPopover>
  );
}

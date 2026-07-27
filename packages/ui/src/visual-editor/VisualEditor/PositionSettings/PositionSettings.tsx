import {
  faCircleHalfStroke,
  faPalette,
} from '@fortawesome/free-solid-svg-icons';
import { ActionToolbarPopover } from '../../../atoms/ActionToolbar';
import { Checkbox } from '../../../atoms/Checkbox';
import { Dropdown } from '../../../atoms/Dropdown';
import { RangeInput } from '../../../atoms/RangeInput';
import {
  GAME_IMAGE_POSITIONS,
  type GameLayoutPosition,
  type GameTextGrowDirection,
} from '../../../options/types';
import type { PositionSettingsProps } from './types';

export function TextSettings({
  copy,
  position,
  selection,
  onUpdate,
}: PositionSettingsProps) {
  return (
    <ActionToolbarPopover
      icon={faPalette}
      label={copy.visualEditor.textFormatting}
    >
      <h2>{copy.visualEditor.textFormatting}</h2>
      <label>
        {copy.visualEditor.size}
        <RangeInput
          min="50"
          max="200"
          value={Math.round(position.fontScale * 100)}
          onChange={(event) =>
            onUpdate(selection, {
              fontScale: Number(event.target.value) / 100,
            })
          }
        />
        <output>{Math.round(position.fontScale * 100)}%</output>
      </label>
      <label>
        {copy.visualEditor.color}
        <input
          type="color"
          value={position.textColor}
          onChange={(event) =>
            onUpdate(selection, { textColor: event.target.value })
          }
        />
      </label>
      <label>
        {copy.visualEditor.direction}
        <Dropdown
          value={position.textGrowDirection}
          onChange={(event) =>
            onUpdate(selection, {
              textGrowDirection: event.target.value as GameTextGrowDirection,
            })
          }
        >
          <option value="up">{copy.visualEditor.up}</option>
          <option value="down">{copy.visualEditor.down}</option>
        </Dropdown>
      </label>
      <label>
        {copy.visualEditor.fitHeight}
        <Checkbox
          checked={position.fitTextToHeight}
          onChange={(event) =>
            onUpdate(selection, { fitTextToHeight: event.target.checked })
          }
        />
      </label>
    </ActionToolbarPopover>
  );
}

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

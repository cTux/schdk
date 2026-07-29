import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { ActionToolbarPopover } from '../../../atoms/ActionToolbar';
import { Checkbox } from '../../../atoms/Checkbox';
import { Dropdown } from '../../../atoms/Dropdown';
import { RangeInput } from '../../../atoms/RangeInput';
import { type GameTextGrowDirection } from '../../../options/types';
import type { PositionSettingsProps } from './types';
import { ImagePositionSettings } from '../ImagePositionSettings';

function TextSettings({
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

export { TextSettings, ImagePositionSettings };

import {
  faAlignCenter,
  faAlignJustify,
  faAlignLeft,
  faAlignRight,
  faBold,
  faItalic,
  faPalette,
  faUnderline,
} from '@fortawesome/free-solid-svg-icons';
import {
  ActionToolbarButton,
  ActionToolbarPopover,
} from '../../../atoms/ActionToolbar';
import { Dropdown } from '../../../atoms/Dropdown';
import { RangeInput } from '../../../atoms/RangeInput';
import { type GameLayoutPosition } from '../../../options/types';
import type { PositionSettingsProps } from './types';

const ALIGNMENTS = [
  ['left', faAlignLeft],
  ['center', faAlignCenter],
  ['right', faAlignRight],
  ['justify', faAlignJustify],
] as const;

export function TextSettings({
  copy,
  position,
  selection,
  onUpdate,
}: PositionSettingsProps) {
  const alignmentLabels = {
    left: copy.visualEditor.alignLeft,
    center: copy.visualEditor.alignCenter,
    right: copy.visualEditor.alignRight,
    justify: copy.visualEditor.alignJustify,
  };
  return (
    <>
      {ALIGNMENTS.map(([textAlign, icon]) => (
        <ActionToolbarButton
          key={textAlign}
          icon={icon}
          label={alignmentLabels[textAlign]}
          pressed={position.textAlign === textAlign}
          onClick={() => onUpdate(selection, { textAlign })}
        />
      ))}
      <ActionToolbarButton
        icon={faBold}
        label={copy.visualEditor.bold}
        pressed={position.textBold}
        onClick={() => onUpdate(selection, { textBold: !position.textBold })}
      />
      <ActionToolbarButton
        icon={faItalic}
        label={copy.visualEditor.italic}
        pressed={position.textItalic}
        onClick={() =>
          onUpdate(selection, { textItalic: !position.textItalic })
        }
      />
      <ActionToolbarButton
        icon={faUnderline}
        label={copy.visualEditor.underline}
        pressed={position.textUnderline}
        onClick={() =>
          onUpdate(selection, { textUnderline: !position.textUnderline })
        }
      />
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
          {copy.visualEditor.verticalAlignment}
          <Dropdown
            value={position.textGrowDirection}
            onChange={(event) =>
              onUpdate(selection, {
                textGrowDirection: event.target
                  .value as GameLayoutPosition['textGrowDirection'],
              })
            }
          >
            <option value="down">{copy.visualEditor.up}</option>
            <option value="center">{copy.visualEditor.center}</option>
            <option value="up">{copy.visualEditor.down}</option>
          </Dropdown>
        </label>
        <label>
          {copy.visualEditor.lineHeight}
          <RangeInput
            min="80"
            max="200"
            value={Math.round(position.lineHeight * 100)}
            onChange={(event) =>
              onUpdate(selection, {
                lineHeight: Number(event.target.value) / 100,
              })
            }
          />
          <output>{Math.round(position.lineHeight * 100)}%</output>
        </label>
        <label>
          {copy.visualEditor.letterSpacing}
          <RangeInput
            min="-10"
            max="50"
            value={Math.round(position.letterSpacing * 100)}
            onChange={(event) =>
              onUpdate(selection, {
                letterSpacing: Number(event.target.value) / 100,
              })
            }
          />
          <output>{Math.round(position.letterSpacing * 100)}%</output>
        </label>
      </ActionToolbarPopover>
    </>
  );
}

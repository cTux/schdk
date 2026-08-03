import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';
import { faFillDrip } from '@fortawesome/free-solid-svg-icons/faFillDrip';
import {
  ActionToolbarButton,
  ActionToolbarPopover,
} from '../../../atoms/ActionToolbar';
import { Checkbox } from '../../../atoms/Checkbox';
import { RangeInput } from '../../../atoms/RangeInput';
import type { PositionSettingsProps } from '../PositionSettings/types';

export function ElementStyleSettings({
  copy,
  position,
  selection,
  onUpdate,
  onCommitChange,
}: PositionSettingsProps) {
  const hasBackground = position.backgroundColor !== null;
  const continuousChangeEnd = {
    onBlur: onCommitChange,
    onKeyUp: onCommitChange,
    onPointerCancel: onCommitChange,
    onPointerUp: onCommitChange,
  };
  return (
    <>
      <ActionToolbarPopover
        icon={faFillDrip}
        label={copy.visualEditor.elementStyle}
      >
        <h2>{copy.visualEditor.elementStyle}</h2>
        <label>
          {copy.visualEditor.backgroundColor}
          <input
            type="color"
            value={position.backgroundColor ?? '#252938'}
            onChange={(event) =>
              onUpdate(selection, { backgroundColor: event.target.value }, true)
            }
            onBlur={onCommitChange}
          />
        </label>
        <label>
          {copy.visualEditor.gradient}
          <Checkbox
            checked={position.backgroundGradientColor !== null}
            disabled={!hasBackground}
            onChange={(event) =>
              onUpdate(selection, {
                backgroundGradientColor: event.target.checked
                  ? '#5d527d'
                  : null,
              })
            }
          />
        </label>
        {position.backgroundGradientColor && (
          <>
            <label>
              {copy.visualEditor.gradientColor}
              <input
                type="color"
                value={position.backgroundGradientColor}
                onChange={(event) =>
                  onUpdate(
                    selection,
                    {
                      backgroundGradientColor: event.target.value,
                    },
                    true,
                  )
                }
                onBlur={onCommitChange}
              />
            </label>
            <label>
              {copy.visualEditor.gradientDirection}
              <RangeInput
                min="0"
                max="359"
                value={position.backgroundGradientDirection}
                onChange={(event) =>
                  onUpdate(
                    selection,
                    {
                      backgroundGradientDirection: Number(event.target.value),
                    },
                    true,
                  )
                }
                {...continuousChangeEnd}
              />
              <output>{position.backgroundGradientDirection}°</output>
            </label>
          </>
        )}
        <label>
          {copy.visualEditor.backgroundOpacity}
          <RangeInput
            min="0"
            max="100"
            disabled={!hasBackground}
            value={Math.round(position.backgroundOpacity * 100)}
            onChange={(event) =>
              onUpdate(
                selection,
                {
                  backgroundOpacity: Number(event.target.value) / 100,
                },
                true,
              )
            }
            {...continuousChangeEnd}
          />
          <output>{Math.round(position.backgroundOpacity * 100)}%</output>
        </label>
        <label>
          {copy.visualEditor.rounding}
          <RangeInput
            min="0"
            max="50"
            value={position.borderRadius}
            onChange={(event) =>
              onUpdate(
                selection,
                { borderRadius: Number(event.target.value) },
                true,
              )
            }
            {...continuousChangeEnd}
          />
          <output>{position.borderRadius}%</output>
        </label>
        <label>
          {copy.visualEditor.elementOpacity}
          <RangeInput
            min="0"
            max="100"
            value={Math.round(position.contentOpacity * 100)}
            onChange={(event) =>
              onUpdate(
                selection,
                {
                  contentOpacity: Number(event.target.value) / 100,
                },
                true,
              )
            }
            {...continuousChangeEnd}
          />
          <output>{Math.round(position.contentOpacity * 100)}%</output>
        </label>
      </ActionToolbarPopover>
      <ActionToolbarButton
        icon={faBan}
        label={copy.visualEditor.removeElementBackground}
        disabled={!hasBackground}
        onClick={() =>
          onUpdate(selection, {
            backgroundColor: null,
            backgroundGradientColor: null,
          })
        }
      />
    </>
  );
}

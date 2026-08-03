import { faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons/faCircleHalfStroke';
import { faFillDrip } from '@fortawesome/free-solid-svg-icons/faFillDrip';
import { faImage } from '@fortawesome/free-solid-svg-icons/faImage';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan';
import {
  ActionToolbar,
  ActionToolbarButton,
  ActionToolbarPopover,
} from '../../../../atoms/ActionToolbar';
import { Checkbox } from '../../../../atoms/Checkbox';
import { RangeInput } from '../../../../atoms/RangeInput';
import type { LocalizationCopy } from '../../../../localization';
import type { GamePresentationOptions } from '../../../../options/types';
import type { VisualEditorToolbarProps } from '../types';

interface WorkspaceToolbarProps {
  actions: VisualEditorToolbarProps['actions'];
  copy: LocalizationCopy;
  game: GamePresentationOptions;
}

export function WorkspaceToolbar({
  actions,
  copy,
  game,
}: WorkspaceToolbarProps) {
  const continuousChangeEnd = {
    onBlur: actions.commitChange,
    onKeyUp: actions.commitChange,
    onPointerCancel: actions.commitChange,
    onPointerUp: actions.commitChange,
  };
  return (
    <ActionToolbar label={copy.visualEditor.workspaceActions}>
      <ActionToolbarButton
        icon={faImage}
        label={
          game.backgroundImage
            ? copy.visualEditor.replaceBackground
            : copy.visualEditor.applyImage
        }
        onClick={() => actions.chooseImage('background')}
      />
      {game.backgroundImage && (
        <ActionToolbarButton
          danger
          icon={faTrashCan}
          label={copy.visualEditor.removeBackground}
          onClick={() => actions.onChange({ ...game, backgroundImage: null })}
        />
      )}
      <ActionToolbarPopover
        icon={faCircleHalfStroke}
        label={copy.visualEditor.backgroundOpacity}
      >
        <h2>{copy.visualEditor.backgroundOpacity}</h2>
        <label>
          {copy.visualEditor.opacity}
          <RangeInput
            min="0"
            max="100"
            disabled={!game.backgroundImage}
            value={Math.round((1 - game.backgroundOpacity) * 100)}
            onChange={(event) =>
              actions.onChange(
                {
                  ...game,
                  backgroundOpacity: 1 - Number(event.target.value) / 100,
                },
                { continuous: true },
              )
            }
            {...continuousChangeEnd}
          />
          <output>{Math.round((1 - game.backgroundOpacity) * 100)}%</output>
        </label>
      </ActionToolbarPopover>
      <ActionToolbarPopover
        icon={faFillDrip}
        label={copy.visualEditor.canvasGradient}
      >
        <h2>{copy.visualEditor.canvasGradient}</h2>
        <label>
          {copy.visualEditor.gradient}
          <Checkbox
            checked={game.backgroundGradientFrom !== null}
            onChange={(event) =>
              actions.onChange({
                ...game,
                backgroundGradientFrom: event.target.checked ? '#100f14' : null,
              })
            }
          />
        </label>
        <label>
          {copy.visualEditor.gradientStart}
          <input
            type="color"
            disabled={!game.backgroundGradientFrom}
            value={game.backgroundGradientFrom ?? '#100f14'}
            onChange={(event) =>
              actions.onChange(
                {
                  ...game,
                  backgroundGradientFrom: event.target.value,
                },
                { continuous: true },
              )
            }
            onBlur={actions.commitChange}
          />
        </label>
        <label>
          {copy.visualEditor.gradientColor}
          <input
            type="color"
            disabled={!game.backgroundGradientFrom}
            value={game.backgroundGradientTo}
            onChange={(event) =>
              actions.onChange(
                {
                  ...game,
                  backgroundGradientTo: event.target.value,
                },
                { continuous: true },
              )
            }
            onBlur={actions.commitChange}
          />
        </label>
        <label>
          {copy.visualEditor.gradientDirection}
          <RangeInput
            min="0"
            max="359"
            disabled={!game.backgroundGradientFrom}
            value={game.backgroundGradientDirection}
            onChange={(event) =>
              actions.onChange(
                {
                  ...game,
                  backgroundGradientDirection: Number(event.target.value),
                },
                { continuous: true },
              )
            }
            {...continuousChangeEnd}
          />
          <output>{game.backgroundGradientDirection}°</output>
        </label>
      </ActionToolbarPopover>
    </ActionToolbar>
  );
}

import {
  faCircleHalfStroke,
  faImage,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import {
  ActionToolbar,
  ActionToolbarButton,
  ActionToolbarPopover,
} from '../../../../atoms/ActionToolbar';
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
              actions.onChange({
                ...game,
                backgroundOpacity: 1 - Number(event.target.value) / 100,
              })
            }
          />
          <output>{Math.round((1 - game.backgroundOpacity) * 100)}%</output>
        </label>
      </ActionToolbarPopover>
    </ActionToolbar>
  );
}

import {
  faCircleHalfStroke,
  faEye,
  faEyeSlash,
  faImage,
  faPen,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import {
  ActionToolbar,
  ActionToolbarButton,
  ActionToolbarPopover,
  ActionToolbarSeparator,
} from '../../../atoms/ActionToolbar';
import { Textarea } from '../../../atoms/Textarea';
import type { GameLayoutElementId } from '../../../options/types';
import { ImagePositionSettings, TextSettings } from '../PositionSettings';
import type { VisualEditorToolbarProps } from './types';

const GRAPHIC_ELEMENTS = new Set<GameLayoutElementId>(['logo', 'handout']);

export function VisualEditorToolbar({
  copy,
  game,
  labels,
  selected,
  selectedCustom,
  selectedPosition,
  chooseImage,
  onChange,
  removeCustom,
  updateCustom,
  updatePosition,
}: VisualEditorToolbarProps) {
  if (!selected || !selectedPosition) {
    return (
      <ActionToolbar label={copy.visualEditor.workspaceActions}>
        <ActionToolbarButton
          icon={faImage}
          label={
            game.backgroundImage
              ? copy.visualEditor.replaceBackground
              : copy.visualEditor.applyImage
          }
          onClick={() => chooseImage('background')}
        />
        {game.backgroundImage && (
          <ActionToolbarButton
            danger
            icon={faTrashCan}
            label={copy.visualEditor.removeBackground}
            onClick={() => onChange({ ...game, backgroundImage: null })}
          />
        )}
        <ActionToolbarPopover
          icon={faCircleHalfStroke}
          label={copy.visualEditor.backgroundOpacity}
        >
          <h2>{copy.visualEditor.backgroundOpacity}</h2>
          <label>
            {copy.visualEditor.opacity}
            <input
              type="range"
              min="0"
              max="100"
              disabled={!game.backgroundImage}
              value={Math.round((1 - game.backgroundOpacity) * 100)}
              onChange={(event) =>
                onChange({
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

  if (selected.kind === 'built-in') {
    return (
      <ActionToolbar label={copy.visualEditor.actions(labels[selected.id])}>
        {GRAPHIC_ELEMENTS.has(selected.id) ? (
          <ImagePositionSettings
            copy={copy}
            position={selectedPosition}
            selection={selected}
            onUpdate={updatePosition}
          />
        ) : (
          <TextSettings
            copy={copy}
            position={selectedPosition}
            selection={selected}
            onUpdate={updatePosition}
          />
        )}
        <ActionToolbarSeparator />
        <ActionToolbarButton
          icon={selectedPosition.hidden ? faEye : faEyeSlash}
          label={
            selectedPosition.hidden
              ? copy.visualEditor.showInGame
              : copy.visualEditor.hideInGame
          }
          pressed={selectedPosition.hidden}
          onClick={() =>
            updatePosition(selected, { hidden: !selectedPosition.hidden })
          }
        />
      </ActionToolbar>
    );
  }

  if (!selectedCustom) return null;
  return (
    <ActionToolbar
      label={copy.visualEditor.actions(
        selectedCustom.kind === 'text'
          ? copy.visualEditor.ownText
          : copy.visualEditor.ownImage,
      )}
    >
      {selectedCustom.kind === 'text' ? (
        <>
          <ActionToolbarPopover icon={faPen} label={copy.visualEditor.editText}>
            <h2>{copy.visualEditor.editText}</h2>
            <label htmlFor="visual-editor-custom-text">
              {copy.visualEditor.text}
            </label>
            <Textarea
              id="visual-editor-custom-text"
              maxLength={500}
              value={selectedCustom.text}
              onChange={(event) => {
                if (event.target.value) {
                  updateCustom(selectedCustom.id, { text: event.target.value });
                }
              }}
            />
          </ActionToolbarPopover>
          <TextSettings
            copy={copy}
            position={selectedPosition}
            selection={selected}
            onUpdate={updatePosition}
          />
        </>
      ) : (
        <>
          <ActionToolbarButton
            icon={faImage}
            label={
              selectedCustom.image
                ? copy.visualEditor.replaceImage
                : copy.visualEditor.applyImage
            }
            onClick={() => chooseImage(selectedCustom.id)}
          />
          <ActionToolbarButton
            danger
            disabled={!selectedCustom.image}
            icon={faTrashCan}
            label={copy.visualEditor.removeImage}
            onClick={() => updateCustom(selectedCustom.id, { image: null })}
          />
          <ImagePositionSettings
            copy={copy}
            position={selectedPosition}
            selection={selected}
            onUpdate={updatePosition}
          />
        </>
      )}
      <ActionToolbarSeparator />
      <ActionToolbarButton
        icon={selectedPosition.hidden ? faEye : faEyeSlash}
        label={
          selectedPosition.hidden
            ? copy.visualEditor.showInGame
            : copy.visualEditor.hideInGame
        }
        pressed={selectedPosition.hidden}
        onClick={() =>
          updatePosition(selected, { hidden: !selectedPosition.hidden })
        }
      />
      <ActionToolbarButton
        danger
        icon={faTrashCan}
        label={copy.visualEditor.removeElement}
        onClick={() => removeCustom(selectedCustom.id)}
      />
    </ActionToolbar>
  );
}

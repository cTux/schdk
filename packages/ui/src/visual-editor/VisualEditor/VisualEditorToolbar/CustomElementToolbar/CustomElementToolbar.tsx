import { faImage } from '@fortawesome/free-solid-svg-icons/faImage';
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan';
import {
  ActionToolbar,
  ActionToolbarButton,
  ActionToolbarPopover,
  ActionToolbarSeparator,
} from '../../../../atoms/ActionToolbar';
import { Textarea } from '../../../../atoms/Textarea';
import type { LocalizationCopy } from '../../../../localization';
import type {
  CustomGameElement,
  GameLayoutPosition,
} from '../../../../options/types';
import { ElementStyleSettings } from '../../ElementStyleSettings';
import { ImagePositionSettings } from '../../ImagePositionSettings';
import { TextSettings } from '../../PositionSettings';
import type { ElementSelection } from '../../types';
import type { VisualEditorToolbarProps } from '../types';
import { ElementVisibilityButton } from '../ElementVisibilityButton';

interface CustomElementToolbarProps {
  actions: VisualEditorToolbarProps['actions'];
  copy: LocalizationCopy;
  element: CustomGameElement;
  position: GameLayoutPosition;
  selection: ElementSelection & { kind: 'custom' };
}

export function CustomElementToolbar({
  actions,
  copy,
  element,
  position,
  selection,
}: CustomElementToolbarProps) {
  return (
    <ActionToolbar
      label={copy.visualEditor.actions(
        element.kind === 'text'
          ? copy.visualEditor.ownText
          : copy.visualEditor.ownImage,
      )}
    >
      {element.kind === 'text' ? (
        <>
          <ActionToolbarPopover icon={faPen} label={copy.visualEditor.editText}>
            <h2>{copy.visualEditor.editText}</h2>
            <label htmlFor="visual-editor-custom-text">
              {copy.visualEditor.text}
            </label>
            <Textarea
              id="visual-editor-custom-text"
              maxLength={500}
              value={element.text}
              onChange={(event) => {
                if (event.target.value) {
                  actions.updateCustom(element.id, {
                    text: event.target.value,
                  });
                }
              }}
            />
          </ActionToolbarPopover>
          <TextSettings
            copy={copy}
            position={position}
            selection={selection}
            onUpdate={actions.updatePosition}
          />
        </>
      ) : (
        <>
          <ActionToolbarButton
            icon={faImage}
            label={
              element.image
                ? copy.visualEditor.replaceImage
                : copy.visualEditor.applyImage
            }
            onClick={() => actions.chooseImage(element.id)}
          />
          <ActionToolbarButton
            danger
            disabled={!element.image}
            icon={faTrashCan}
            label={copy.visualEditor.removeImage}
            onClick={() => actions.updateCustom(element.id, { image: null })}
          />
          <ImagePositionSettings
            copy={copy}
            position={position}
            selection={selection}
            onUpdate={actions.updatePosition}
          />
        </>
      )}
      <ActionToolbarSeparator />
      <ElementStyleSettings
        copy={copy}
        position={position}
        selection={selection}
        onUpdate={actions.updatePosition}
      />
      <ActionToolbarSeparator />
      <ElementVisibilityButton
        copy={copy}
        hidden={Boolean(position.hidden)}
        onChange={(hidden) => actions.updatePosition(selection, { hidden })}
      />
      <ActionToolbarButton
        danger
        icon={faTrashCan}
        label={copy.visualEditor.removeElement}
        onClick={() => actions.removeCustom(element.id)}
      />
    </ActionToolbar>
  );
}

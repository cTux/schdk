import type {
  GameLayoutElementId,
  GameLayoutPosition,
} from '../../../../options/types';
import type { LocalizationCopy } from '../../../../localization';
import {
  ActionToolbar,
  ActionToolbarSeparator,
} from '../../../../atoms/ActionToolbar';
import { ElementStyleSettings } from '../../ElementStyleSettings';
import { ImagePositionSettings } from '../../ImagePositionSettings';
import { TextSettings } from '../../PositionSettings';
import type { ElementSelection } from '../../types';
import { ElementVisibilityButton } from '../ElementVisibilityButton';

const GRAPHIC_ELEMENTS = new Set<GameLayoutElementId>(['logo', 'handout']);

interface BuiltInElementToolbarProps {
  copy: LocalizationCopy;
  label: string;
  position: GameLayoutPosition;
  selection: ElementSelection & { kind: 'built-in' };
  onUpdate(
    selection: ElementSelection,
    patch: Partial<GameLayoutPosition>,
  ): void;
}

export function BuiltInElementToolbar({
  copy,
  label,
  position,
  selection,
  onUpdate,
}: BuiltInElementToolbarProps) {
  return (
    <ActionToolbar label={copy.visualEditor.actions(label)}>
      {GRAPHIC_ELEMENTS.has(selection.id) ? (
        <ImagePositionSettings
          copy={copy}
          position={position}
          selection={selection}
          onUpdate={onUpdate}
        />
      ) : (
        <TextSettings
          copy={copy}
          position={position}
          selection={selection}
          onUpdate={onUpdate}
        />
      )}
      <ActionToolbarSeparator />
      <ElementStyleSettings
        copy={copy}
        position={position}
        selection={selection}
        onUpdate={onUpdate}
      />
      <ActionToolbarSeparator />
      <ElementVisibilityButton
        copy={copy}
        hidden={Boolean(position.hidden)}
        onChange={(hidden) => onUpdate(selection, { hidden })}
      />
    </ActionToolbar>
  );
}

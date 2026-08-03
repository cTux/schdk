import { BuiltInElementToolbar } from './BuiltInElementToolbar/BuiltInElementToolbar';
import { CustomElementToolbar } from './CustomElementToolbar/CustomElementToolbar';
import { WorkspaceToolbar } from './WorkspaceToolbar/WorkspaceToolbar';
import type { VisualEditorToolbarProps } from './types';

export function VisualEditorToolbar({
  copy,
  game,
  labels,
  selection,
  actions,
}: VisualEditorToolbarProps) {
  const { custom, element, position } = selection;
  if (!element || !position) {
    return <WorkspaceToolbar copy={copy} game={game} actions={actions} />;
  }
  if (element.kind === 'built-in') {
    return (
      <BuiltInElementToolbar
        copy={copy}
        label={labels[element.id]}
        position={position}
        selection={element}
        onUpdate={actions.updatePosition}
        onCommitChange={actions.commitChange}
      />
    );
  }
  if (!custom) return null;
  return (
    <CustomElementToolbar
      actions={actions}
      copy={copy}
      element={custom}
      position={position}
      selection={element}
    />
  );
}

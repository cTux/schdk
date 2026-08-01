import './styles.scss';
import classNames from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import { useLocalization } from '../../localization';
import { GameCustomElement } from '../../game-presentation/GameElements';
import {
  createCustomElement,
  getDraggedPosition,
  getNextZoom,
  getResizedPosition,
} from './utils/geometry';
import {
  GAME_LAYOUT_ELEMENT_IDS,
  type GameLayoutElementId,
} from '../../options/types';
import { VisualEditorSidebar } from './VisualEditorSidebar';
import { VisualEditorPreview } from './VisualEditorPreview';
import { VisualEditorToolbar } from './VisualEditorToolbar';
import { VisualLayoutItem } from './VisualLayoutItem';
import type { ElementSelection, VisualEditorProps } from './types';
import { useVisualEditor } from './hooks/useVisualEditor';

const selectionKey = (selection: ElementSelection) =>
  `${selection.kind}:${selection.id}`;

function VisualEditor({
  canRedo,
  canUndo,
  hidden,
  game,
  message,
  onChange,
  onImportTemplate,
  onExportTemplate,
  onRedo,
  onUndo,
}: VisualEditorProps) {
  const { copy } = useLocalization();
  const editor = useVisualEditor(game, copy, onChange, {
    canRedo,
    canUndo,
    onRedo,
    onUndo,
  });
  const labels: Record<GameLayoutElementId, string> = {
    logo: copy.visualEditor.labels.logo,
    intro: copy.visualEditor.labels.intro,
    handout: copy.visualEditor.labels.handout,
    question: copy.visualEditor.labels.question,
    timer: copy.visualEditor.labels.timer,
    'answer-comment': copy.visualEditor.labels.answerComment,
    'alternative-answer': copy.visualEditor.labels.alternativeAnswer,
    answer: copy.visualEditor.labels.answer,
    progress: copy.visualEditor.labels.progress,
    controls: copy.visualEditor.labels.controls,
  };
  const renderItem = (
    selection: ElementSelection,
    label: string,
    content: ReactNode,
  ) => {
    const position =
      selection.kind === 'built-in'
        ? editor.positions[selection.id]
        : game.customElements.find(({ id }) => id === selection.id)!.position;
    const selected =
      editor.selected &&
      selectionKey(editor.selected) === selectionKey(selection);
    return (
      <VisualLayoutItem
        key={selectionKey(selection)}
        content={content}
        dragInstruction={copy.visualEditor.dragInstruction}
        fitWarningLabel={copy.visualEditor.fitWarning}
        hiddenLabel={copy.visualEditor.hidden}
        hiddenSuffix={copy.visualEditor.hiddenSuffix}
        label={label}
        position={position}
        selected={Boolean(selected)}
        selection={selection}
        onRemove={() => {
          if (selection.kind === 'custom') {
            editor.removeCustom(selection.id);
          }
        }}
        onSelect={() => editor.setSelected(selection)}
        onUpdate={(patch) => editor.updatePosition(selection, patch)}
        pointerPosition={editor.pointerPosition}
      />
    );
  };

  return (
    <div className="visual-editor" hidden={hidden}>
      <VisualEditorSidebar
        canRedo={canRedo}
        canUndo={canUndo}
        copy={copy}
        addElement={editor.addElement}
        onExportTemplate={onExportTemplate}
        onImportTemplate={onImportTemplate}
        onRedo={onRedo}
        onUndo={onUndo}
      />
      <div
        ref={editor.workspaceRef}
        className={classNames('visual-editor-workspace', {
          'is-panning': editor.panning,
        })}
        onKeyDown={editor.handleWorkspaceKeyDown}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={editor.startPan}
        onPointerMove={editor.previewPan}
        onPointerUp={editor.finishPan}
        onPointerCancel={editor.cancelPan}
      >
        <div className="visual-editor-toolbar">
          <VisualEditorToolbar
            copy={copy}
            game={game}
            labels={labels}
            selection={{
              element: editor.selected,
              custom: editor.selectedCustom,
              position: editor.selectedPosition ?? null,
            }}
            actions={{
              chooseImage: editor.chooseImage,
              onChange,
              removeCustom: editor.removeCustom,
              updateCustom: editor.updateCustom,
              updatePosition: editor.updatePosition,
            }}
          />
        </div>
        <input
          ref={editor.fileInputRef}
          className="visual-editor-file-input"
          type="file"
          accept="image/*"
          onChange={(event) => void editor.handleImageChange(event)}
        />
        <div
          ref={editor.canvasRef}
          className={classNames('visual-editor-canvas', 'game-presentation', {
            'is-selected': !editor.selected,
          })}
          tabIndex={0}
          style={
            {
              transform: `translate(-50%, -50%) translate(${editor.pan.x}px, ${editor.pan.y}px) scale(${editor.zoom})`,
              '--game-surface-background-image': game.backgroundImage
                ? `url(${JSON.stringify(game.backgroundImage)})`
                : 'none',
              '--game-surface-background-opacity': game.backgroundOpacity,
            } as CSSProperties
          }
          aria-label={copy.visualEditor.gameLayout}
          aria-current={editor.selected ? undefined : 'true'}
          role="region"
          onClick={(event) => {
            if (event.target === event.currentTarget) editor.selectWorkspace();
          }}
        >
          {GAME_LAYOUT_ELEMENT_IDS.map((id) =>
            renderItem(
              { kind: 'built-in', id },
              labels[id],
              <VisualEditorPreview copy={copy} id={id} />,
            ),
          )}
          {game.customElements.map((element) =>
            renderItem(
              { kind: 'custom', id: element.id },
              element.kind === 'text'
                ? copy.visualEditor.ownText
                : copy.visualEditor.ownImage,
              <GameCustomElement element={element} preview />,
            ),
          )}
        </div>
        {(editor.localMessage || message) && (
          <p className="visual-editor-message" role="alert">
            {editor.localMessage || message}
          </p>
        )}
      </div>
    </div>
  );
}

export {
  VisualEditor,
  createCustomElement,
  getDraggedPosition,
  getNextZoom,
  getResizedPosition,
};

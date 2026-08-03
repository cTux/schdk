import './styles.scss';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { getGameSurfaceStyle } from '../../game-presentation/game-surface-style';
import { useLocalization, type LocalizationCopy } from '../../localization';
import {
  GameAnswer,
  GameAnswerComment,
  GameAlternativeAnswer,
  GameControls,
  GameCustomElement,
  GameHandout,
  GameLogo,
  GameProgress,
  GameQuestion,
  GameQuestionIntro,
  GameTimer,
} from '../../game-presentation/GameElements';
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
import { VisualEditorSidebar } from './VisualEditorSidebar/VisualEditorSidebar';
import { VisualEditorToolbar } from './VisualEditorToolbar/VisualEditorToolbar';
import { VisualLayoutItem } from './VisualLayoutItem/VisualLayoutItem';
import type { ElementSelection, VisualEditorProps } from './types';
import { useVisualEditor } from './hooks/useVisualEditor';

function getBuiltInElements(copy: LocalizationCopy) {
  const elements: Record<
    GameLayoutElementId,
    { content: ReactNode; label: string }
  > = {
    logo: { content: <GameLogo />, label: copy.visualEditor.labels.logo },
    intro: {
      content: <GameQuestionIntro questionNumber={5} />,
      label: copy.visualEditor.labels.intro,
    },
    handout: {
      content: <GameHandout copy={copy} />,
      label: copy.visualEditor.labels.handout,
    },
    question: {
      content: <GameQuestion>{copy.visualEditor.previewText}</GameQuestion>,
      label: copy.visualEditor.labels.question,
    },
    timer: {
      content: <GameTimer seconds={42} />,
      label: copy.visualEditor.labels.timer,
    },
    'answer-comment': {
      content: (
        <GameAnswerComment>{copy.shared.answerComment}</GameAnswerComment>
      ),
      label: copy.visualEditor.labels.answerComment,
    },
    'alternative-answer': {
      content: (
        <GameAlternativeAnswer>
          {copy.editor.alternativeAnswers}
        </GameAlternativeAnswer>
      ),
      label: copy.visualEditor.labels.alternativeAnswer,
    },
    answer: {
      content: <GameAnswer answer={copy.shared.answer} />,
      label: copy.visualEditor.labels.answer,
    },
    progress: {
      content: <GameProgress questionNumber={5} questionCount={36} />,
      label: copy.visualEditor.labels.progress,
    },
    controls: {
      content: (
        <GameControls
          copy={copy}
          canGoBack
          controlsDisabled={false}
          preview
          onBack={() => undefined}
          onNext={() => undefined}
        />
      ),
      label: copy.visualEditor.labels.controls,
    },
  };
  return GAME_LAYOUT_ELEMENT_IDS.map((id) => ({ id, ...elements[id] }));
}

const selectionKey = (selection: ElementSelection) =>
  `${selection.kind}:${selection.id}`;

function VisualEditor({
  canRedo,
  canUndo,
  hidden,
  game,
  message,
  onChange,
  onCommitChange,
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
  const builtInElements = getBuiltInElements(copy);
  const labels = Object.fromEntries(
    builtInElements.map(({ id, label }) => [id, label]),
  ) as Record<GameLayoutElementId, string>;
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
              commitChange: onCommitChange,
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
          style={{
            ...getGameSurfaceStyle(game),
            transform: `translate(-50%, -50%) translate(${editor.pan.x}px, ${editor.pan.y}px) scale(${editor.zoom})`,
          }}
          aria-label={copy.visualEditor.gameLayout}
          aria-current={editor.selected ? undefined : 'true'}
          role="region"
          onClick={(event) => {
            if (event.target === event.currentTarget) editor.selectWorkspace();
          }}
        >
          {builtInElements.map(({ content, id, label }) =>
            renderItem({ kind: 'built-in', id }, label, content),
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

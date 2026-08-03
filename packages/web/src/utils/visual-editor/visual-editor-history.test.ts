import { DEFAULT_GAME_OPTIONS } from '@schdk/common/game-options';
import { describe, expect, it } from 'vitest';
import {
  createVisualEditorHistory,
  recordVisualEditorChange,
  reduceVisualEditorHistory,
  redoVisualEditorChange,
  undoVisualEditorChange,
} from './visual-editor-history';

describe('visual editor history', () => {
  it('records, undoes, and redoes immutable presentation snapshots', () => {
    const original = { ...DEFAULT_GAME_OPTIONS, backgroundOpacity: 0.2 };
    const changed = { ...original, backgroundOpacity: 0.8 };
    const history = recordVisualEditorChange(
      createVisualEditorHistory(),
      original,
    );

    const undone = undoVisualEditorChange(history, changed);
    expect(undone?.value.backgroundOpacity).toBe(0.2);
    expect(history.past).toHaveLength(1);

    const redone = redoVisualEditorChange(undone!.history, original);
    expect(redone?.value.backgroundOpacity).toBe(0.8);
  });

  it('retains only the bounded number of recent snapshots', () => {
    let history = createVisualEditorHistory();
    for (let index = 0; index <= 100; index += 1) {
      history = recordVisualEditorChange(history, {
        ...DEFAULT_GAME_OPTIONS,
        backgroundOpacity: index,
      });
    }

    expect(history.past).toHaveLength(100);
    expect(
      undoVisualEditorChange(history, DEFAULT_GAME_OPTIONS)?.value,
    ).toMatchObject({ backgroundOpacity: 100 });
  });

  it('coalesces a continuous edit into one undo entry', () => {
    const original = { ...DEFAULT_GAME_OPTIONS, backgroundOpacity: 0.2 };
    const preview = { ...original, backgroundOpacity: 0.4 };
    let history = createVisualEditorHistory();

    history = reduceVisualEditorHistory(history, {
      type: 'record',
      current: original,
      continuous: true,
    });
    history = reduceVisualEditorHistory(history, {
      type: 'record',
      current: preview,
      continuous: true,
    });

    expect(history.past).toHaveLength(1);
    expect(undoVisualEditorChange(history, DEFAULT_GAME_OPTIONS)?.value).toBe(
      original,
    );
  });
});

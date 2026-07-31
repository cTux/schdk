import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DEFAULT_GAME_LAYOUT } from '../../../options/types';
import { GameLayoutItem } from '../../../host/GameLayoutItem';
import { VisualLayoutItem } from '../VisualLayoutItem';

describe('game layout rendering contract', () => {
  it('applies every persisted bound in host and editor markup', () => {
    const position = DEFAULT_GAME_LAYOUT.question;
    const host = renderToStaticMarkup(
      <GameLayoutItem id="question" layout={DEFAULT_GAME_LAYOUT}>
        Question
      </GameLayoutItem>,
    );
    const editor = renderToStaticMarkup(
      <VisualLayoutItem
        content="Question"
        dragInstruction="Move"
        fitWarningLabel="Overflow"
        hiddenLabel="Hidden"
        hiddenSuffix=" hidden"
        label="Question"
        position={position}
        selected={false}
        selection={{ kind: 'built-in', id: 'question' }}
        onRemove={() => undefined}
        onSelect={() => undefined}
        onUpdate={() => undefined}
        pointerPosition={() => null}
      />,
    );

    expect(host).toContain(`--game-layout-x:${position.x}%`);
    expect(host).toContain(`--game-layout-y:${position.y}%`);
    expect(host).toContain(`--game-layout-width:${position.width}%`);
    expect(host).toContain(`--game-layout-height:${position.height}%`);
    expect(editor).toContain(`left:${position.x}%`);
    expect(editor).toContain(`top:${position.y}%`);
    expect(editor).toContain(`width:${position.width}%`);
    expect(editor).toContain(`height:${position.height}%`);
  });
});

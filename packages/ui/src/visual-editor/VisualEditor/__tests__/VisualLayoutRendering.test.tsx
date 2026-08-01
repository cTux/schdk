import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GAME_LAYOUT,
  GAME_LAYOUT_ELEMENT_IDS,
} from '../../../options/types';
import { GameLayoutItem } from '../../../game-presentation/GameLayoutItem';
import { VisualLayoutItem } from '../VisualLayoutItem';

describe('game layout rendering contract', () => {
  it.each(GAME_LAYOUT_ELEMENT_IDS)(
    'keeps the %s styles identical in host and editor markup',
    (id) => {
      const position = DEFAULT_GAME_LAYOUT[id];
      const host = renderToStaticMarkup(
        <GameLayoutItem id={id} layout={DEFAULT_GAME_LAYOUT}>
          Content
        </GameLayoutItem>,
      );
      const editor = renderToStaticMarkup(
        <VisualLayoutItem
          content="Content"
          dragInstruction="Move"
          fitWarningLabel="Overflow"
          hiddenLabel="Hidden"
          hiddenSuffix=" hidden"
          label={id}
          position={position}
          selected={false}
          selection={{ kind: 'built-in', id }}
          onRemove={() => undefined}
          onSelect={() => undefined}
          onUpdate={() => undefined}
          pointerPosition={() => null}
        />,
      );
      const styles = [
        `--game-layout-x:${position.x}%`,
        `--game-layout-y:${position.y}%`,
        `--game-layout-width:${position.width}%`,
        `--game-layout-height:${position.height}%`,
        `--game-font-scale:${position.fontScale}`,
        `--game-text-color:${position.textColor}`,
        `--game-grow-align:${position.textGrowDirection === 'up' ? 'flex-end' : 'flex-start'}`,
        `--game-image-position:${position.imagePosition}`,
      ];

      for (const style of styles) {
        expect(host).toContain(style);
        expect(editor).toContain(style);
      }
    },
  );
});

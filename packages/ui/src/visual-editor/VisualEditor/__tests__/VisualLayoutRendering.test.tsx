import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GAME_LAYOUT,
  GAME_LAYOUT_ELEMENT_IDS,
} from '../../../options/types';
import { GameLayoutItem } from '../../../game-presentation/GameLayoutItem';
import { VisualLayoutItem } from '../VisualLayoutItem/VisualLayoutItem';

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
      const growAlign =
        position.textGrowDirection === 'up'
          ? 'flex-end'
          : position.textGrowDirection === 'center'
            ? 'center'
            : 'flex-start';
      const itemsAlign =
        position.textAlign === 'left'
          ? 'flex-start'
          : position.textAlign === 'right'
            ? 'flex-end'
            : position.textAlign === 'justify'
              ? 'stretch'
              : 'center';
      const styles = [
        `--game-layout-x:${position.x}%`,
        `--game-layout-y:${position.y}%`,
        `--game-layout-width:${position.width}%`,
        `--game-layout-height:${position.height}%`,
        `--game-font-scale:${position.fontScale}`,
        `--game-text-color:${position.textColor}`,
        `--game-text-align:${position.textAlign}`,
        `--game-text-items-align:${itemsAlign}`,
        `--game-font-weight:${position.textBold ? 700 : 400}`,
        `--game-font-style:${position.textItalic ? 'italic' : 'normal'}`,
        `--game-text-decoration:${position.textUnderline ? 'underline' : 'none'}`,
        `--game-line-height:${position.lineHeight}`,
        `--game-letter-spacing:${position.letterSpacing}em`,
        `--game-grow-align:${growAlign}`,
        `--game-image-position:${position.imagePosition}`,
        '--game-element-background:transparent',
        `--game-element-radius:${position.borderRadius}%`,
        `--game-content-opacity:${position.contentOpacity}`,
      ];

      for (const style of styles) {
        expect(host).toContain(style);
        expect(editor).toContain(style);
      }
    },
  );
});

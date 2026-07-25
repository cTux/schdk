import { describe, expect, it } from 'vitest';
import { GameControls, GameHandout, GameTimer } from '..';

describe('shared game elements', () => {
  it('renders only the formatted time', () => {
    expect(GameTimer({ seconds: 42 })).toMatchObject({
      type: 'div',
      props: {
        className: 'game-timer',
        children: { type: 'strong', props: { children: '00:42' } },
      },
    });
  });

  it('composes handout and preview classes', () => {
    expect(
      GameHandout({ className: 'is-entering' }).props.className,
    ).toMatchInlineSnapshot(
      `"game-handout is-entering game-handout-placeholder"`,
    );
    expect(
      GameControls({
        canGoBack: true,
        controlsDisabled: false,
        preview: true,
        onBack: () => undefined,
        onNext: () => undefined,
      }).props.className,
    ).toMatchInlineSnapshot(`"game-controls is-preview"`);
  });
});

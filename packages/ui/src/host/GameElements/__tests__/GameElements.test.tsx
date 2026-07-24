import { describe, expect, it } from 'vitest';
import { GameTimer } from '..';

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
});

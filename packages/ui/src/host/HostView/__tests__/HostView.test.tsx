import { describe, expect, it } from 'vitest';
import { HostView } from '..';

const render = (finished: boolean) =>
  HostView({
    message: '',
    presentation: {
      backgroundImage: null,
      backgroundOpacity: 1,
      backgroundGradientFrom: null,
      backgroundGradientTo: '#2b3048',
      backgroundGradientDirection: 135,
      layout: null,
    },
    packages: {
      packageDetails: null,
      recentPackages: [],
      onBack: () => undefined,
      onOpen: () => undefined,
      onOpenRecent: () => undefined,
      onStart: () => undefined,
    },
    session: {
      finished,
      game: null,
      onBack: () => undefined,
      onNext: () => undefined,
      onReturn: () => undefined,
    },
  });

describe('HostView', () => {
  it('adds the playing class only during a game flow', () => {
    expect(render(false).props.className).toMatchInlineSnapshot(
      `"host-app game-presentation"`,
    );
    expect(render(true).props.className).toMatchInlineSnapshot(
      `"host-app game-presentation is-playing"`,
    );
  });
});

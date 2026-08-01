import { describe, expect, it } from 'vitest';
import { HostView } from '..';

const render = (finished: boolean) =>
  HostView({
    backgroundImage: null,
    backgroundOpacity: 1,
    finished,
    game: null,
    layout: null,
    message: '',
    packageDetails: null,
    recentPackages: [],
    onBack: () => undefined,
    onGameBack: () => undefined,
    onGameNext: () => undefined,
    onOpenPackage: () => undefined,
    onOpenRecentPackage: () => undefined,
    onReturnToGames: () => undefined,
    onStartGame: () => undefined,
  });

describe('HostView', () => {
  it('adds the playing class only during a game flow', () => {
    expect(render(false).props.className).toMatchInlineSnapshot(
      `"editor-app host-app game-presentation"`,
    );
    expect(render(true).props.className).toMatchInlineSnapshot(
      `"editor-app host-app game-presentation is-playing"`,
    );
  });
});

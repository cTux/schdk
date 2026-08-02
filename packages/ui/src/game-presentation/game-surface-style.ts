import type { CSSProperties } from 'react';
import type { GamePresentationOptions } from '../options/types';

export function getGameSurfaceStyle(
  options: Pick<
    GamePresentationOptions,
    | 'backgroundImage'
    | 'backgroundOpacity'
    | 'backgroundGradientFrom'
    | 'backgroundGradientTo'
    | 'backgroundGradientDirection'
  >,
): CSSProperties {
  return {
    '--game-surface-background-image': options.backgroundImage
      ? `url(${JSON.stringify(options.backgroundImage)})`
      : 'none',
    '--game-surface-background-opacity': options.backgroundOpacity,
    '--game-surface-background-gradient': options.backgroundGradientFrom
      ? `linear-gradient(${options.backgroundGradientDirection}deg, ${options.backgroundGradientFrom}, ${options.backgroundGradientTo})`
      : 'none',
  } as CSSProperties;
}

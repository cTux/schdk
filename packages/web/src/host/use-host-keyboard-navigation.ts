import { useEffect } from 'react';
import type { Direction } from './get-game-wizard-move';

export function useHostKeyboardNavigation(
  active: boolean,
  move: (direction: Direction) => void,
) {
  useEffect(() => {
    if (!active) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.target instanceof HTMLMediaElement) return;
      const isForwardKey =
        event.code === 'Space' ||
        event.code === 'PageDown' ||
        event.code === 'ArrowRight';
      const isBackwardKey =
        event.code === 'Backspace' ||
        event.code === 'PageUp' ||
        event.code === 'ArrowLeft';
      if (isForwardKey) {
        event.preventDefault();
        move('forward');
      } else if (isBackwardKey) {
        event.preventDefault();
        move('backward');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, move]);
}

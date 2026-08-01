import { useLayoutEffect, useRef } from 'react';
import { MIN_FIT_SCALE } from './constants';
import type { FitTextObserverProps } from './types';
import { getFitScale } from './get-fit-scale';

function FitTextObserver({ enabled, warningLabel }: FitTextObserverProps) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrapper = markerRef.current?.parentElement;
    const content = wrapper?.firstElementChild as HTMLElement | null;
    if (!wrapper || !content) return;
    const clearWarning = () => {
      wrapper.classList.remove('is-fit-overflowing');
      delete wrapper.dataset.fitWarning;
    };
    if (!enabled) {
      wrapper.style.removeProperty('--game-fit-scale');
      clearWarning();
      return;
    }

    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { height, maxHeight, overflow } = content.style;
        content.style.height = 'auto';
        content.style.maxHeight = 'none';
        content.style.overflow = 'visible';
        const scale = getFitScale((candidate) => {
          wrapper.style.setProperty('--game-fit-scale', String(candidate));
          return (
            content.scrollHeight <= wrapper.clientHeight + 1 &&
            content.scrollWidth <= wrapper.clientWidth + 1
          );
        });
        const safeScale =
          scale === 1 ? 1 : Math.max(MIN_FIT_SCALE, scale - 0.002);
        wrapper.style.setProperty('--game-fit-scale', safeScale.toFixed(3));
        const overflowing =
          content.scrollHeight > wrapper.clientHeight + 1 ||
          content.scrollWidth > wrapper.clientWidth + 1;
        wrapper.classList.toggle('is-fit-overflowing', overflowing);
        if (overflowing && warningLabel) {
          wrapper.dataset.fitWarning = warningLabel;
        } else {
          delete wrapper.dataset.fitWarning;
        }
        content.style.height = height;
        content.style.maxHeight = maxHeight;
        content.style.overflow = overflow;
      });
    };
    const resizeObserver = new ResizeObserver(fit);
    const mutationObserver = new MutationObserver(fit);
    resizeObserver.observe(wrapper);
    mutationObserver.observe(content, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    fit();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearWarning();
    };
  }, [enabled, warningLabel]);

  return (
    <span ref={markerRef} className="game-fit-observer" aria-hidden="true" />
  );
}

export { getFitScale, FitTextObserver };

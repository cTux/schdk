import { useLayoutEffect, useRef } from 'react';

const MIN_FIT_SCALE = 0.01;

export function getFitScale(fits: (scale: number) => boolean) {
  if (fits(1)) return 1;
  if (!fits(MIN_FIT_SCALE)) return MIN_FIT_SCALE;
  let low = MIN_FIT_SCALE;
  let high = 1;
  for (let index = 0; index < 10; index += 1) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  return low;
}

export function FitTextObserver({ enabled }: { enabled: boolean }) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrapper = markerRef.current?.parentElement;
    const content = wrapper?.firstElementChild as HTMLElement | null;
    if (!wrapper || !content) return;
    if (!enabled) {
      wrapper.style.removeProperty('--game-fit-scale');
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
    };
  }, [enabled]);

  return (
    <span ref={markerRef} className="game-fit-observer" aria-hidden="true" />
  );
}

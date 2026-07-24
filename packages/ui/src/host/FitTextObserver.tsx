import { useLayoutEffect, useRef } from 'react';

const MIN_FIT_SCALE = 0.05;

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
        const scale = getFitScale((candidate) => {
          wrapper.style.setProperty('--game-fit-scale', String(candidate));
          return content.scrollHeight <= content.clientHeight + 1;
        });
        const safeScale =
          scale === 1 ? 1 : Math.max(MIN_FIT_SCALE, scale - 0.01);
        wrapper.style.setProperty('--game-fit-scale', safeScale.toFixed(3));
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

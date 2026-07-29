export function prefersReducedMotion(): boolean {
  return (
    document.documentElement.dataset.uiAnimations === 'false' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

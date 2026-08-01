export function getSelectedIndexAfterSwap(
  selectedIndex: number,
  sourceIndex: number,
  targetIndex: number,
) {
  if (selectedIndex === sourceIndex) return targetIndex;
  if (selectedIndex === targetIndex) return sourceIndex;
  return selectedIndex;
}

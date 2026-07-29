export function saveStatusAfterWrite(isLatest: boolean): 'saved' | 'pending' {
  return isLatest ? 'saved' : 'pending';
}

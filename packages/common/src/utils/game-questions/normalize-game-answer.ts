export function normalizeGameAnswer(answer: string) {
  return answer.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
}

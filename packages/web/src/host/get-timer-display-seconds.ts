export function getTimerDisplaySeconds(
  remainingSeconds: number,
  submissionSeconds: number,
): number {
  return remainingSeconds > submissionSeconds
    ? remainingSeconds - submissionSeconds
    : remainingSeconds;
}

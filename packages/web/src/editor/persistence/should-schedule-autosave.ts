export function shouldScheduleAutosave(status: string, canWrite: boolean) {
  return status === 'pending' && canWrite;
}

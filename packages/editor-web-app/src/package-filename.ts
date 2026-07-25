function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function createPackageFilename(
  title: string,
  date = new Date(),
  fallback = 'Незавершена гра',
) {
  const safeTitle =
    title.replace(/[\p{Cc}<>:"/\\|?*]/gu, '-').trim() || fallback;
  const time = [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(pad)
    .join('.');
  return `${safeTitle} ${time}.schdk`;
}

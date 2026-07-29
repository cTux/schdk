import { toRecentPackage } from './to-recent-package';

function downloadPackage(name: string, content: Uint8Array) {
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(content)], { type: 'application/zip' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export { downloadPackage, toRecentPackage };

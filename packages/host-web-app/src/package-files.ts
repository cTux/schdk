import { parseGamePackage } from '@schdk/common';
import {
  toDrivePackageReference,
  type DriveGamePackageFile,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import type { RecentPackageItem } from '@schdk/ui/host';

export function downloadPackage(name: string, content: Uint8Array) {
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(content)], { type: 'application/zip' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export async function toRecentPackage(
  drive: DrivePackageStorage,
  { id, name, title, ready }: DriveGamePackageFile,
): Promise<RecentPackageItem> {
  if (title === undefined) {
    try {
      title = parseGamePackage((await drive.loadGamePackage(id)).content).title;
    } catch {
      // Legacy or unavailable packages still fall back to their filename.
    }
  }
  return {
    id: toDrivePackageReference(id),
    name,
    ...(title === undefined ? {} : { title }),
    ...(ready === undefined ? {} : { ready }),
  };
}

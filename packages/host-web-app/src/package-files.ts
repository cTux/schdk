import {
  toDrivePackageReference,
  type DriveGamePackageFile,
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

export function toRecentPackage({
  id,
  name,
  title,
  ready,
  hasRemarks,
}: DriveGamePackageFile): RecentPackageItem {
  return {
    id: toDrivePackageReference(id),
    name,
    ...(title === undefined ? {} : { title }),
    ...(ready === undefined ? {} : { ready }),
    ...(hasRemarks === undefined ? {} : { hasRemarks }),
  };
}

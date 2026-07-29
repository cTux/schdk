import {
  toDrivePackageReference,
  type DriveGamePackageFile,
} from '@schdk/google-drive';
import type { RecentPackageItem } from '@schdk/ui/host';

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

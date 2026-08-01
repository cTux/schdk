import {
  toDrivePackageReference,
  type DriveGamePackageFile,
} from '@schdk/google-drive/game-packages';
import type { RecentPackageItem } from '@schdk/ui/game-packages';

export function toRecentGamePackage({
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

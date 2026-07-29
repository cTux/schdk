import { PackageDropZone } from '../PackageDropZone';
import { RecentPackages } from '../RecentPackages';
import { type PackageStartProps } from './package-start-props';

function PackageStart({
  hidden,
  openingRecentPackageId = null,
  recentPackages,
  recentPackagesLoading = false,
  onCreatePackage,
  onDeleteRecentPackage,
  onDownloadRecentPackage,
  onOpenPackage,
  onOpenRecentPackage,
}: PackageStartProps) {
  const busy = openingRecentPackageId !== null;

  return (
    <>
      <PackageDropZone
        disabled={busy}
        hidden={hidden}
        onCreate={onCreatePackage}
        onOpen={onOpenPackage}
      />
      <RecentPackages
        hidden={hidden}
        loading={recentPackagesLoading}
        openingPackageId={openingRecentPackageId}
        packages={recentPackages}
        onDelete={onDeleteRecentPackage}
        onDownload={onDownloadRecentPackage}
        onOpen={onOpenRecentPackage}
      />
    </>
  );
}

export { type PackageStartProps, PackageStart };

import { RecentPackages } from '../RecentPackages';
import { type PackageStartProps } from './package-start-props';

function PackageStart({
  hidden,
  openingRecentPackageId = null,
  recentPackages,
  recentPackagesLoading = false,
  onDeleteRecentPackage,
  onDownloadRecentPackage,
  onOpenRecentPackage,
}: PackageStartProps) {
  return (
    <>
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

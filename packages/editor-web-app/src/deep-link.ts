const PACKAGE_PARAMETER = 'package';

export function getDeepLinkedPackageName(url: string): string | null {
  try {
    return new URL(url).searchParams.get(PACKAGE_PARAMETER)?.trim() || null;
  } catch {
    return null;
  }
}

export function getPackageDeepLink(url: string, packageName: string | null) {
  const nextUrl = new URL(url);
  if (packageName) nextUrl.searchParams.set(PACKAGE_PARAMETER, packageName);
  else nextUrl.searchParams.delete(PACKAGE_PARAMETER);
  return nextUrl.href;
}

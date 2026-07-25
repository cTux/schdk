import { getPackageDeepLink, getQuestionDeepLink } from './deep-link';

export function replaceBrowserPackageDeepLink(
  packageName: string | null,
  selectedIndex?: number,
) {
  if (window.desktop) return;
  let deepLink = getPackageDeepLink(window.location.href, packageName);
  if (packageName && selectedIndex !== undefined) {
    deepLink = getQuestionDeepLink(deepLink, selectedIndex);
  }
  window.history.replaceState(window.history.state, '', deepLink);
}

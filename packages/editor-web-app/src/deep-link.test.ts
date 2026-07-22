import { describe, expect, it } from 'vitest';
import { getDeepLinkedPackageName, getPackageDeepLink } from './deep-link';

describe('package deep links', () => {
  it('round-trips a package name while preserving the rest of the URL', () => {
    const deepLink = getPackageDeepLink(
      'https://example.com/editor?theme=dark#questions',
      'Моя гра.schdk',
    );

    expect(deepLink).toBe(
      'https://example.com/editor?theme=dark&package=%D0%9C%D0%BE%D1%8F+%D0%B3%D1%80%D0%B0.schdk#questions',
    );
    expect(getDeepLinkedPackageName(deepLink)).toBe('Моя гра.schdk');
    expect(getPackageDeepLink(deepLink, null)).toBe(
      'https://example.com/editor?theme=dark#questions',
    );
  });

  it('ignores missing or invalid package links', () => {
    expect(getDeepLinkedPackageName('https://example.com/editor')).toBeNull();
    expect(getDeepLinkedPackageName('not a URL')).toBeNull();
  });
});

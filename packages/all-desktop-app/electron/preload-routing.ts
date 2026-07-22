export function isEditorFrameUrl(url: URL, isMainFrame: boolean) {
  return (
    !isMainFrame &&
    ((url.hostname === '127.0.0.1' && url.port === '5175') ||
      /\/apps\/editor\/index\.html$/u.test(url.pathname))
  );
}

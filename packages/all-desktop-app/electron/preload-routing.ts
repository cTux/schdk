export function isEditorFrameUrl(url: URL, isMainFrame: boolean) {
  return (
    !isMainFrame &&
    ((url.hostname === '127.0.0.1' && url.port === '5175') ||
      /\/apps\/editor\/index\.html$/u.test(url.pathname))
  );
}

interface CloseRequestFrame {
  readonly url: string;
  readonly framesInSubtree: CloseRequestFrame[];
  send(channel: string, attempt: number): void;
}

export function sendCloseRequestToEditorFrames(
  mainFrame: CloseRequestFrame,
  attempt: number,
) {
  const editorFrames = mainFrame.framesInSubtree.filter(
    (frame) =>
      frame !== mainFrame && isEditorFrameUrl(new URL(frame.url), false),
  );
  for (const frame of editorFrames) frame.send('close-requested', attempt);
  return editorFrames.length > 0;
}

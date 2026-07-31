export function createDriveMultipartBody(
  metadata: unknown,
  contentType: string,
  content: BlobPart,
) {
  const boundary = `schdk-${crypto.randomUUID()}`;
  return {
    body: new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      JSON.stringify(metadata),
      `\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
      content,
      `\r\n--${boundary}--`,
    ]),
    contentType: `multipart/related; boundary=${boundary}`,
  };
}

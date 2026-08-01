type GoogleDriveErrorCode = 'authorization' | 'invalid-data' | 'unavailable';

class GoogleDriveError extends Error {
  constructor(
    message: string,
    readonly code: GoogleDriveErrorCode,
  ) {
    super(message);
    this.name = 'GoogleDriveError';
  }
}

export { GoogleDriveError, type GoogleDriveErrorCode };

import { GoogleDriveError } from './google-drive-error.js';

class GoogleDriveAuthorizationError extends GoogleDriveError {
  constructor(message: string) {
    super(message, 'authorization');
    this.name = 'GoogleDriveAuthorizationError';
  }
}

export { GoogleDriveAuthorizationError };

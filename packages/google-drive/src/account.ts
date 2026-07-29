import { type DriveAccount } from './drive-account.js';

function parseDriveAccount(value: unknown): DriveAccount | null {
  const user =
    value && typeof value === 'object'
      ? (value as { user?: Partial<DriveAccount> }).user
      : undefined;
  if (
    typeof user?.displayName !== 'string' ||
    typeof user.emailAddress !== 'string'
  ) {
    return null;
  }
  return {
    displayName: user.displayName,
    emailAddress: user.emailAddress,
    ...(typeof user.photoLink === 'string'
      ? { photoLink: user.photoLink }
      : {}),
  };
}

export { type DriveAccount, parseDriveAccount };

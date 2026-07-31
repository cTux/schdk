import { type DriveAccount } from './drive-account.js';

function parseDriveAccount(value: unknown): DriveAccount | null {
  const user =
    value && typeof value === 'object'
      ? (value as { user?: Partial<DriveAccount> }).user
      : undefined;
  const hasDisplayName = typeof user?.displayName === 'string';
  const hasEmailAddress = typeof user?.emailAddress === 'string';
  if (!hasDisplayName || !hasEmailAddress) return null;
  return {
    displayName: user.displayName as string,
    emailAddress: user.emailAddress as string,
    ...(typeof user.photoLink === 'string'
      ? { photoLink: user.photoLink }
      : {}),
  };
}

export { type DriveAccount, parseDriveAccount };

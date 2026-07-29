import { app } from 'electron';
import { join } from 'node:path';

export const legacyTokenPath = () =>
  join(app.getPath('userData'), 'google-drive-refresh-token.bin');

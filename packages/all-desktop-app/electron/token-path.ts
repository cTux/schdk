import { app } from 'electron';
import { join } from 'node:path';

export const tokenPath = () =>
  join(app.getPath('userData'), 'google-drive-refresh-token-v2.bin');

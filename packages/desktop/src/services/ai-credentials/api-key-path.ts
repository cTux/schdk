import { app } from 'electron';
import { join } from 'node:path';

export const apiKeyPath = () => join(app.getPath('userData'), 'ai-api-key.bin');

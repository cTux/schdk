import { DEFAULT_CLIENT_ID } from './default-client-id.js';

export const clientId =
  process.env.GOOGLE_DESKTOP_CLIENT_ID?.trim() || DEFAULT_CLIENT_ID;

import { copyFile, writeFile } from 'node:fs/promises';

const target = new URL('../build/google-oauth-client.json', import.meta.url);
const source = process.env.GOOGLE_DESKTOP_CREDENTIALS_PATH?.trim();

if (source) {
  await copyFile(source, target);
} else {
  await writeFile(target, '{"installed":{}}\n');
}

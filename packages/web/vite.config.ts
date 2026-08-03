import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const versionSource = readFileSync(
  new URL('./version.json', import.meta.url),
  'utf8',
);
const { version } = JSON.parse(versionSource) as { version?: unknown };

const hasValidVersion = typeof version === 'string' && Boolean(version);
if (!hasValidVersion) {
  throw new Error('version.json must contain a non-empty version string.');
}

export default defineConfig({
  base: './',
  build: { manifest: true },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  publicDir: '../ui/public',
  plugins: [
    react(),
    {
      name: 'app-version',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: versionSource,
        });
      },
    },
  ],
});

import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

function includeSchdkApps(): Plugin {
  const apps = ['host', 'editor'] as const;

  return {
    name: 'include-schdk-apps',
    async closeBundle() {
      await Promise.all(
        apps.map(async (app) => {
          const target = fileURLToPath(
            new URL(`./dist/apps/${app}/`, import.meta.url),
          );
          await mkdir(target, { recursive: true });
          await cp(
            fileURLToPath(new URL(`../${app}-web-app/dist/`, import.meta.url)),
            target,
            { recursive: true },
          );
        }),
      );
    },
  };
}

export default defineConfig({
  base: './',
  publicDir: '../../assets',
  plugins: [react(), includeSchdkApps()],
});

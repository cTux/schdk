import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        editor: fileURLToPath(
          new URL('./src/editor/EditorView/index.ts', import.meta.url),
        ),
        host: fileURLToPath(
          new URL('./src/host/HostView/index.ts', import.meta.url),
        ),
        shell: fileURLToPath(
          new URL('./src/shell/ShellView/index.ts', import.meta.url),
        ),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@schdk/common', 'react', 'react/jsx-runtime'],
    },
  },
});

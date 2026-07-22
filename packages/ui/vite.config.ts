import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        editor: fileURLToPath(
          new URL('./src/editor/EditorView.tsx', import.meta.url),
        ),
        host: fileURLToPath(
          new URL('./src/host/HostView.tsx', import.meta.url),
        ),
        shell: fileURLToPath(
          new URL('./src/shell/ShellView.tsx', import.meta.url),
        ),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@schdk/common', 'react', 'react/jsx-runtime'],
    },
  },
});

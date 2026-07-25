import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) =>
          id.includes('node_modules') ? 'vendors' : undefined,
      },
    },
  },
  publicDir: '../ui/public',
  plugins: [react()],
});

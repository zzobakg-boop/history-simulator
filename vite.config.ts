import { defineConfig } from 'vite';

export default defineConfig({
  base: '/history-simulator/',
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  build: {
    minify: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('phaser')) {
            return 'phaser';
          }
          return undefined;
        },
      },
    },
  },
});

import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      // Use source during development to avoid requiring a build
      '@mindfiredigital/pivothead-web-component':
        '../../packages/web-component/src/index.ts',
    },
  },
  server: {
    open: '/index.html',
  },
});

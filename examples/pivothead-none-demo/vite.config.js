import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@mindfiredigital/pivothead-web-component':
        '../../packages/web-component/dist/pivot-head.js',
    },
  },
  server: { open: '/index.html' },
});

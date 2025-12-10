import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@mindfiredigital/pivothead': resolve(
        __dirname,
        '../../packages/core/dist/pivothead-core.mjs'
      ),
    },
    conditions: ['import', 'module', 'browser', 'default'],
  },
  server: {
    port: 5173,
    strictPort: false,
    fs: {
      strict: false,
    },
  },
});

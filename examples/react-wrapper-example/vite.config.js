import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mindfiredigital/pivothead': path.resolve(
        __dirname,
        '../../packages/core/dist/pivothead-core.mjs'
      ),
      '@mindfiredigital/pivothead-react': path.resolve(
        __dirname,
        '../../packages/react/dist/index.js'
      ),
      '@mindfiredigital/pivothead-web-component': path.resolve(
        __dirname,
        '../../packages/web-component/dist/pivot-head.mjs'
      ),
    },
  },
});

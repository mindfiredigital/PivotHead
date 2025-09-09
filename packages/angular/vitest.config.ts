import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@mindfiredigital/pivothead-web-component': resolve(
        __dirname,
        'src/__mocks__/web-component.ts'
      ),
    },
  },
  esbuild: {
    target: 'node16',
  },
});

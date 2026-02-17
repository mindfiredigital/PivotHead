import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: [
      '@mindfiredigital/pivothead',
      '@mindfiredigital/pivothead-analytics',
      'chart.js',
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

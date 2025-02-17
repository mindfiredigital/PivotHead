/* eslint-disable prettier/prettier */
// vite.config.ts
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular'; // Plugin to enable Angular support

export default defineConfig({
  plugins: [angular()],
  build: {
    target: 'esnext',
    outDir: 'dist', // Output folder
    rollupOptions: {
      input: 'src/main.ts', // Entry point for Angular app
    },
  },
  optimizeDeps: {
    include: ['@mindfiredigital/pivot-head-core'], // External dependencies
  },
});

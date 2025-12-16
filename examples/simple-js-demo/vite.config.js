import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

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
      // Allow serving files from the packages directory
      allow: ['..'],
    },
  },
  plugins: [
    {
      name: 'copy-wasm-files',
      buildStart() {
        // Copy WASM file from core package to public directory
        const wasmSource = resolve(
          __dirname,
          '../../packages/core/dist/wasm/csvParser.wasm'
        );
        const wasmDest = resolve(__dirname, 'public/wasm/csvParser.wasm');
        const wasmDir = resolve(__dirname, 'public/wasm');

        // Create directory if it doesn't exist
        if (!existsSync(wasmDir)) {
          mkdirSync(wasmDir, { recursive: true });
        }

        // Copy WASM file if source exists
        if (existsSync(wasmSource)) {
          copyFileSync(wasmSource, wasmDest);
          console.log('✅ Copied WASM file to public/wasm/');
        } else {
          console.warn('⚠️ WASM file not found at:', wasmSource);
          console.warn('Run "pnpm build:wasm" in packages/core to generate it');
        }
      },
    },
  ],
});

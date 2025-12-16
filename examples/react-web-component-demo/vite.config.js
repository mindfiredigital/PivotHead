import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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

  // Enable WASM support
  assetsInclude: ['**/*.wasm'],

  // Optimize dependencies to handle WASM files
  optimizeDeps: {
    exclude: ['@mindfiredigital/pivothead-web-component'],
  },

  server: {
    // Enable WASM MIME type
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    fs: {
      strict: false,
      // Allow serving files from the packages directory
      allow: ['..'],
    },
  },
});

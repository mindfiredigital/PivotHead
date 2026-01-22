import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PivotHeadCore',
      fileName: 'pivothead-core',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['fs', 'path'],
      output: {
        globals: {},
        assetFileNames: assetInfo => {
          // Keep WASM files with .wasm extension in wasm folder
          if (assetInfo.name && assetInfo.name.endsWith('.wasm')) {
            return 'wasm/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    assetsInlineLimit: 0, // Don't inline WASM files - keep them as separate assets
    copyPublicDir: false, // Don't copy public dir for library builds
  },
  plugins: [
    dts({ include: ['src/**/*'], rollupTypes: false }),
    {
      name: 'copy-wasm-files',
      buildStart() {
        // Preserve WASM files before build starts
        const wasmDir = resolve(__dirname, 'dist/wasm');
        const tempDir = resolve(__dirname, '.temp-wasm');
        const wasmFiles = [
          'csvParser.wasm',
          'csvParser.wasm.map',
          'csvParser.wat',
          'csvParser.js',
          'csvParser.d.ts',
        ];

        if (existsSync(wasmDir)) {
          // Create temp directory
          mkdirSync(tempDir, { recursive: true });

          // Copy WASM files to temp
          wasmFiles.forEach(file => {
            const srcPath = resolve(wasmDir, file);
            const destPath = resolve(tempDir, file);
            if (existsSync(srcPath)) {
              copyFileSync(srcPath, destPath);
            }
          });
        }
      },
      closeBundle() {
        // Restore WASM files after build
        const wasmDir = resolve(__dirname, 'dist/wasm');
        const tempDir = resolve(__dirname, '.temp-wasm');
        const wasmFiles = [
          'csvParser.wasm',
          'csvParser.wasm.map',
          'csvParser.wat',
          'csvParser.js',
          'csvParser.d.ts',
        ];

        if (existsSync(tempDir)) {
          // Ensure dist/wasm exists
          mkdirSync(wasmDir, { recursive: true });

          // Copy WASM files back
          let copiedCount = 0;
          wasmFiles.forEach(file => {
            const srcPath = resolve(tempDir, file);
            const destPath = resolve(wasmDir, file);
            if (existsSync(srcPath)) {
              copyFileSync(srcPath, destPath);
              copiedCount++;
              if (file === 'csvParser.wasm') {
                console.log(`✅ WASM module restored: ${file}`);
              }
            }
          });

          if (copiedCount === 0) {
            console.warn(
              '⚠️ No WASM files found to restore. Run: npm run build:wasm'
            );
          }
        } else {
          console.warn(
            '⚠️ WASM files not found. Run: npm run build:wasm before build'
          );
        }
      },
    },
  ],
  assetsInclude: ['**/*.wasm'], // Include WASM files as assets
});

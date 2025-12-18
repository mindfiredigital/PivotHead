import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: tag => tag.includes('-'),
        },
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from the core package dist directory
      allow: ['..', '../..', resolve(__dirname, '../../packages/core/dist')],
    },
  },
  define: {
    __VUE_PROD_DEVTOOLS__: false,
  },
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['@mindfiredigital/pivothead'],
  },
});

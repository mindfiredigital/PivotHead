import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

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
  },
  define: {
    __VUE_PROD_DEVTOOLS__: false,
  },
});

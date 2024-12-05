import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PivotheadCore',
      fileName: 'pivothead-core',
      formats: ['umd']
    },
    rollupOptions: {
      output: {
        globals: {
          PivotheadCore: 'PivotheadCore'
        }
      }
    }
  },
  plugins: [dts()]
})


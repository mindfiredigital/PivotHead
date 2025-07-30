import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/pivot-head.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/pivot-head.mjs',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      // declaration: true,
      // declarationDir: './dist',
      // outDir: './dist',
      // compilerOptions: {
      //   rootDir: './src',
      //   declarationDir: './dist',
      //   outDir: './dist'
      // },
      exclude: ['node_modules/**', 'dist/**']
    })
  ],
  external: ['@mindfiredigital/pivothead']
}); 

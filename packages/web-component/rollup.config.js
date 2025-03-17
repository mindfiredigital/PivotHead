import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/pivot-head.ts',
  output: [
    {
      file: 'dist/pivot-head.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/pivot-head.mjs',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
    }),
  ],
  external: ['@mindfiredigital/pivothead'],
});

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'examples/**',
      'documentation/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['packages/**/*.ts', 'packages/**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    // packages/core is stable and published — relax rules that flag existing code
    files: ['packages/core/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'warn',
    },
  }
);

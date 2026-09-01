import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**', '**/*.astro'],
  },
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'off',
    },
  },
];

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['source-snapshot/**', 'node_modules/**', '.agents/**', '.lab/**', 'output/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.mjs'], languageOptions: { globals: { console: 'readonly', process: 'readonly', URL: 'readonly', Buffer: 'readonly', fetch: 'readonly', AbortSignal: 'readonly' } } }
);

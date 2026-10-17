import tsParser from '@typescript-eslint/parser'

// Check maintained sources and tests; generated bundles have their own formatting.
const config = [{
  ignores: ['builds/**', 'lib/**', 'types/**', 'node_modules/**']
}, {
  files: ['src/**/*.js', 'tests/**/*.js', 'scripts/**/*.js', '*.config.js'],
  languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { structuredClone: 'readonly' } },
  rules: { 'no-unused-vars': ['error', { args: 'none' }], 'no-undef': 'error', curly: 'error', 'no-var': 'error' }
}, {
  files: ['src/**/*.ts'],
  languageOptions: { parser: tsParser, ecmaVersion: 2022, sourceType: 'module' },
  rules: { curly: 'error', 'no-var': 'error' }
}]

export default config

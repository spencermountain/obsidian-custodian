// Check maintained sources and tests; generated bundles have their own formatting.
const config = [{
  ignores: ['builds/**', 'node_modules/**']
}, {
  files: ['src/**/*.js', 'tests/**/*.js', '*.config.js'],
  languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { structuredClone: 'readonly' } },
  rules: { 'no-unused-vars': ['error', { args: 'none' }], 'no-undef': 'error', curly: 'error', 'no-var': 'error' }
}]

export default config

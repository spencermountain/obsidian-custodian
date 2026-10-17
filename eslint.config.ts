import tsParser from '@typescript-eslint/parser'

// Generated JavaScript and declarations are checked through the build.
const config = [{
  ignores: ['builds/**', 'lib/**', 'types/**', 'node_modules/**']
}, {
  files: ['**/*.ts'],
  languageOptions: { parser: tsParser, ecmaVersion: 2022, sourceType: 'module' },
  rules: { curly: 'error', 'no-var': 'error' }
}]

export default config

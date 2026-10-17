import { writeFileSync } from 'node:fs'
import { URL } from 'node:url'

// CommonJS exports are callable functions, not ESM default-export namespaces.
const entries = ['index', 'remark']
entries.forEach((entry) => {
  const declaration = `declare const entry: typeof import('./${entry}.js', { with: { 'resolution-mode': 'import' } }).default\nexport = entry\n`
  writeFileSync(new URL(`../types/${entry}.d.cts`, import.meta.url), declaration)
})

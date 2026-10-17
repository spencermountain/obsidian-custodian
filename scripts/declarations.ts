import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { URL } from 'node:url'

// Declarations reference published .d.ts files through standard .js specifiers.
const root = new URL('../types/', import.meta.url)
readdirSync(root, { recursive: true }).forEach((file) => {
  if (String(file).endsWith('.d.ts')) {
    const path = new URL(String(file), root)
    const source = readFileSync(path, 'utf8')
    writeFileSync(path, source.replace(/(['"])(\.{1,2}\/[^'"\n]+)\.ts\1/g, '$1$2.js$1'))
  }
})

// CommonJS exports are callable functions, not ESM default-export namespaces.
const entries = ['index', 'remark']
entries.forEach((entry) => {
  const declaration = `declare const entry: typeof import('./${entry}.js', { with: { 'resolution-mode': 'import' } }).default\nexport = entry\n`
  writeFileSync(new URL(`../types/${entry}.d.cts`, import.meta.url), declaration)
})

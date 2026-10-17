import { readdirSync } from 'node:fs'
import test from 'tape'

// Tape's CLI uses require for .ts files; load them natively as ES modules.
const root = new URL('../tests/', import.meta.url)
const files = readdirSync(root, { recursive: true })
  .filter((file) => String(file).endsWith('.test.ts'))
  .sort()

test.wait()
for (const file of files) {
  await import(new URL(String(file), root).href)
}
test.run()

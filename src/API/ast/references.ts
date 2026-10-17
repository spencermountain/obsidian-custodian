import { walk } from '../../parse/syntax/_lib.ts'

const normalize = (identifier: string) => identifier.replace(/\s+/g, ' ').toUpperCase()

// Resolve against the current tree so removed definitions never leave stale URLs.
const definitions = (tree) => {
  const result = new Map<string, any>()
  walk(tree, (node) => {
    if (node.type === 'definition') {
      const key = normalize(node.identifier)
      if (!result.has(key)) {
        result.set(key, node)
      }
    }
  })
  return result
}

export { definitions, normalize }

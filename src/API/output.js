import { groups } from './json.js'

// The same inclusion flags apply to every output format.
const includes = (node, options) => {
  if (options.blockIds === false && node.type === 'blockId') { return false }
  if (options.html === false && node.type === 'html') { return false }
  return !Object.entries(groups).some(([key, matches]) => options[key] === false && matches(node))
}

const outputTree = (tree, options = {}) => {
  const copy = (node) => {
    if (!includes(node, options)) { return null }
    const result = { ...node }
    if (node.children) { result.children = node.children.map(copy).filter(Boolean) }
    if (Array.isArray(node.title)) {
      result.title = options.calloutTitles === false ? [] : node.title.map(copy).filter(Boolean)
    }
    if (options.blockIds === false) { delete result.blockId }
    return result
  }
  return structuredClone(copy(tree))
}

export default outputTree

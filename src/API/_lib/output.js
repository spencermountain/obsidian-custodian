import { groups } from '../json.js'

// The same inclusion flags apply to every output format.
const includes = (node, options) => {
  if (options.blockIds === false && node.type === 'blockId') {
    return false
  }
  if (options.html === false && node.type === 'html') {
    return false
  }
  return !Object.entries(groups).some(([key, matches]) => options[key] === false && matches(node))
}

const outputTree = (tree, options = {}) => {
  const copy = (node) => {
    // Excluding a container also excludes everything nested inside it.
    if (!includes(node, options)) {
      return null
    }
    const result = { ...node }
    if (node.children) {
      result.children = node.children.map(copy).filter(Boolean)
    }
    if (Array.isArray(node.title)) {
      result.title = options.calloutTitles === false ? [] : node.title.map(copy).filter(Boolean)
    }
    // Block IDs also appear as metadata on the block they identify.
    if (options.blockIds === false) {
      delete result.blockId
    }
    return result
  }
  // Detach metadata too, so AST consumers cannot mutate the page through a view.
  return structuredClone(copy(tree))
}

export default outputTree

import { walk } from '../../parse/syntax/_lib.js'
import { groups, json } from '../json.js'
import text from '../text.js'

const clearPositions = (tree) => {
  // Source positions no longer describe the document after editing.
  walk(tree, (node) => { delete node.position })
}

// Resolve by identity on each edit: an earlier removal may have detached the node.
const locate = (tree, target) => {
  let found = null
  walk(tree, (node, parent) => {
    if (node === target) { found = parent }
  })
  if (!found) {
    throw new Error('This item has been removed or detached')
  }
  return found
}

// Return original nodes in walk order so handles can edit the live document.
const select = (tree, predicate) => {
  const nodes = []
  walk(tree, (node, parent) => {
    if (predicate(node, parent)) { nodes.push(node) }
  })
  return nodes
}

// Build flat collections from an already-filtered tree in one traversal.
const treeJson = (tree, options) => {
  const result = { text: text(tree, options), blocks: [] }
  Object.keys(groups).forEach((key) => { result[key] = [] })
  walk(tree, (node, parent) => {
    if (parent === tree || node.blockId) { result.blocks.push(json(node, options)) }
    Object.entries(groups).forEach(([key, matches]) => {
      if (matches(node)) { result[key].push(json(node, options)) }
    })
  })
  return result
}

export { clearPositions, locate, select, treeJson }

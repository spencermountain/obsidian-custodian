import type {
  MarkdownNode,
  DocumentNode,
  OutputOptions,
  Predicate,
  PageJSON,
  Collection
} from '../../types/types.ts'
import { walk } from '../../parse/syntax/_lib.ts'
import { groups, json } from '../json.ts'
import text from '../text.ts'

const clearPositions = (tree: MarkdownNode) => {
  // Source positions no longer describe the document after editing.
  walk(tree, (node) => {
    delete node.position
  })
}

// Resolve by identity on each edit: an earlier removal may have detached the node.
const locate = (tree: MarkdownNode, target: MarkdownNode): MarkdownNode => {
  let found: MarkdownNode | null = null
  walk(tree, (node, parent) => {
    if (node === target) {
      found = parent
    }
  })
  if (!found) {
    throw new Error('This item has been removed or detached')
  }
  return found
}

// Return original nodes in walk order so handles can edit the live document.
const select = (tree: MarkdownNode, predicate: Predicate) => {
  const nodes: MarkdownNode[] = []
  walk(tree, (node, parent) => {
    if (predicate(node, parent)) {
      nodes.push(node)
    }
  })
  return nodes
}

// Build flat collections from an already-filtered tree in one traversal.
const treeJson = (tree: DocumentNode, options: OutputOptions): PageJSON => {
  const result = { text: text(tree, options), blocks: [] } as unknown as PageJSON
  Object.keys(groups).forEach((key) => {
    result[key as Collection] = []
  })
  walk(tree, (node, parent) => {
    if (parent === tree || node.blockId) {
      result.blocks.push(json(node, options))
    }
    Object.entries(groups).forEach(([key, matches]) => {
      if (matches(node, null)) {
        result[key as Collection].push(json(node, options))
      }
    })
  })
  return result
}

export { clearPositions, locate, select, treeJson }

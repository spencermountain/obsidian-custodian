import type Page from '../Page.ts'
import type { JsonOptions, PageJSON, Collection } from '../../types/api.ts'
import type { AstNode, PageNode, Predicate } from '../../types/ast.ts'
import { walk } from '../../parse/syntax/_lib.ts'
import createSection from '../Section/index.ts'
import groups from '../Section/groups.ts'
import { jsonText as text } from '../Section/_lib/text.ts'

const clearPositions = (tree: AstNode) => {
  // Source positions no longer describe the document after editing.
  walk(tree, (node) => {
    delete node.position
  })
}

// Resolve by identity on each edit: an earlier removal may have detached the node.
const locate = (tree: AstNode, target: AstNode): AstNode => {
  let found: AstNode | null = null
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
const select = (tree: AstNode, predicate: Predicate) => {
  const nodes: AstNode[] = []
  walk(tree, (node, parent) => {
    if (predicate(node, parent)) {
      nodes.push(node)
    }
  })
  return nodes
}

// Build flat collections from an already-filtered tree in one traversal.
const treeJson = (tree: PageNode, options: JsonOptions, page: Page): PageJSON => {
  const result = { text: text(tree, options) } as PageJSON
  Object.keys(groups).forEach((key) => {
    result[key as Collection] = []
  })
  walk(tree, (node) => {
    Object.entries(groups).forEach(([key, matches]) => {
      if (matches(node, null)) {
        result[key as Collection].push(createSection(node, { page, json: options }).json())
      }
    })
  })
  return result
}

export { clearPositions, locate, select, treeJson }

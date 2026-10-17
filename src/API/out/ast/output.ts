import type { Collection } from '../../../types/api.ts'
import type { OutputOptions } from '../../../types/options.ts'
import type { AstNode } from '../../../types/ast.ts'
import groups from '../../Section/groups.ts'

const extraGroups = {
  quotes: 'blockquote',
  thematicBreaks: 'thematicBreak',
  definitions: 'definition'
}

// The same inclusion flags apply to every output format.
const includes = (node: AstNode, options: OutputOptions) => {
  if (options.blockIds === false && node.type === 'blockId') {
    return false
  }
  if (options.html === false && node.type === 'html') {
    return false
  }
  if (
    Object.entries(extraGroups).some(([key, type]) => options[key] === false && node.type === type)
  ) {
    return false
  }
  return !Object.entries(groups).some(
    ([key, matches]) => options[key as Collection] === false && matches(node, null)
  )
}

const outputTree = (tree: AstNode, options: OutputOptions = {}): AstNode | null => {
  const copy = (node: AstNode): AstNode | null => {
    // Excluding a container also excludes everything nested inside it.
    if (!includes(node, options)) {
      return null
    }
    const result = { ...node }
    if (node.children) {
      result.children = node.children.map(copy).filter((child): child is AstNode => child !== null)
    }
    if (Array.isArray(node.title)) {
      result.title =
        options.callouts === 'body'
          ? []
          : node.title.map(copy).filter((child): child is AstNode => child !== null)
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

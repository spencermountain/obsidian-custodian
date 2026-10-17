import type { MarkdownNode, OutputOptions, Collection } from '../../types/types.ts'
import { groups } from '../json.ts'

// The same inclusion flags apply to every output format.
const includes = (node: MarkdownNode, options: OutputOptions) => {
  if (options.blockIds === false && node.type === 'blockId') {
    return false
  }
  if (options.html === false && node.type === 'html') {
    return false
  }
  return !Object.entries(groups).some(
    ([key, matches]) => options[key as Collection] === false && matches(node, null)
  )
}

const outputTree = (tree: MarkdownNode, options: OutputOptions = {}): MarkdownNode | null => {
  const copy = (node: MarkdownNode): MarkdownNode | null => {
    // Excluding a container also excludes everything nested inside it.
    if (!includes(node, options)) {
      return null
    }
    const result = { ...node }
    if (node.children) {
      result.children = node.children
        .map(copy)
        .filter((child): child is MarkdownNode => child !== null)
    }
    if (Array.isArray(node.title)) {
      result.title =
        options.calloutTitles === false
          ? []
          : node.title.map(copy).filter((child): child is MarkdownNode => child !== null)
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

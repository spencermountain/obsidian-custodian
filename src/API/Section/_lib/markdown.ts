import category from './category.ts'
import type { AstNode } from '../../../types/ast.ts'
import type { MarkdownOptions } from '../../../types/options.ts'
import { createSection } from '../registry.ts'

// Format a detached tree so output choices never edit the live page.
const markdownTree = (tree: AstNode, options: MarkdownOptions) => {
  return createSection(tree, { markdown: options }).markdownNode(options[category(tree)])
}

export default markdownTree

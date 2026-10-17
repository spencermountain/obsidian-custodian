import type { AstNode } from '../../../types/ast.ts'
import type { MarkdownOptions } from '../../../types/options.ts'
import outputTree from '../ast/output.ts'
import { walk } from '../../../parse/syntax/_lib.ts'

// Format a detached tree so output choices never edit the live page.
const markdownTree = (tree: AstNode, options: MarkdownOptions) => {
  const result = outputTree(tree, options)
  if (result && options.headings === 'inline') {
    walk(result, (node) => {
      if (node.type === 'heading') {
        node.type = 'paragraph'
        delete node.depth
      }
    })
  }
  return result
}

export default markdownTree

import type { Root } from 'mdast'
import type { ParseOptions } from '../types/api.ts'
import type { PageNode } from '../types/ast.ts'
import { unified } from 'unified'
import remarkStringify from 'remark-stringify'
import remarkObsidian from './remark.ts'

const stringifyMd = (tree: PageNode, options: ParseOptions = {}) => {
  // Install output handlers without a parser; this operation only reads the tree.
  const processor = unified()
    .use(remarkStringify, { bullet: '-', ...options.markdown })
    .use(remarkObsidian, options)
  // The tree is already transformed. Only run the Markdown serializer.
  return processor.stringify(tree as unknown as Root)
}

export default stringifyMd

import type { AstNode } from '../../../types/ast.ts'
import type { HtmlOptions } from '../../../types/options.ts'
import outputTree from '../ast/output.ts'
import defaults from './defaults.ts'
import prepare from './_lib/prepare.ts'
import render from './_lib/render.ts'

// Render detached nodes directly; no HTML parser or processor is retained.
const html = (tree: AstNode, options: HtmlOptions = {}, context?: AstNode): string => {
  options = { ...defaults, ...options }
  const filtered = outputTree(tree, options)
  if (!filtered) {
    return ''
  }
  const references = context ? outputTree(context, options) : undefined
  return render(prepare(filtered, references), options)
}

export default html

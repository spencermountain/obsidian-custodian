import { toHast } from 'mdast-util-to-hast'
import { toHtml } from 'hast-util-to-html'
import { raw } from 'hast-util-raw'
import type { AstNode } from '../../../types/ast.ts'
import type { HtmlOptions } from '../../../types/options.ts'
import outputTree from '../ast/output.ts'
import defaults from './defaults.ts'
import handlers from './_lib/handlers.ts'
import prepare from './_lib/prepare.ts'
import clean from './_lib/sanitize.ts'

// Each call renders detached nodes; no processor or document state is retained.
const html = (tree: AstNode, options: HtmlOptions = {}, context?: AstNode): string => {
  options = { ...defaults, ...options }
  const filtered = outputTree(tree, options)
  if (!filtered) {
    return ''
  }
  const references = context ? outputTree(context, options) : undefined
  const root = prepare(filtered, references)
  const hast = toHast(root as any, {
    handlers: handlers(options),
    allowDangerousHtml: true,
    clobberPrefix: ''
  })
  return toHtml(clean(raw(hast)))
}

export default html

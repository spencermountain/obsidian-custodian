import type { TextOptions, JsonOptions } from '../../../types/api.ts'
import type { AstNode } from '../../../types/ast.ts'
import { createSection } from '../registry.ts'
import jsonDefaults from '../../out/json.ts'

// Nested nodes use the same overrides as sections returned by Page selectors.
const text = (node: AstNode | null, options: TextOptions = {}): string => {
  if (!node) {
    return ''
  }
  return createSection(node).text(options)
}

// JSON text fields stay plain and use JSON's inclusion policy, not text defaults.
const jsonText = (node: AstNode | null, options: JsonOptions = {}): string =>
  text(node, {
    ...jsonDefaults,
    ...options,
    headings: 'inline',
    comments: false,
    blockIds: false
  })

export { jsonText }
export default text

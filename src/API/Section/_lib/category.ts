import groups from '../groups.ts'
import type { AstNode } from '../../../types/ast.ts'

const extra = {
  html: 'html', blockId: 'blockIds', footnoteReference: 'footnotes',
  blockquote: 'quotes', thematicBreak: 'thematicBreaks', definition: 'definitions'
}

// Shared section methods use the same category as page output options.
const category = (node: AstNode): string =>
  Object.entries(groups).find(([, matches]) => matches(node, null))?.[0] || extra[node.type] || ''

export default category

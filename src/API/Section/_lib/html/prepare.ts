import type { AstNode } from '../../../../types/ast.ts'
import { walk } from '../../../../parse/syntax/_lib.ts'

// Supply section renders with document definitions without rendering unrelated content.
const prepare = (tree: AstNode, context?: AstNode) => {
  let children = [tree]
  if (tree.type === 'root' || tree.type === 'footnoteDefinition') {
    children = tree.children || []
  } else if (context) {
    const definitions: AstNode[] = []
    walk(context, (node) => {
      if (node !== tree && ['definition', 'footnoteDefinition'].includes(node.type)) {
        definitions.push(structuredClone(node))
      }
    })
    children = [...children, ...definitions]
  }
  const root: AstNode = { type: 'root', children }
  return root
}

export default prepare

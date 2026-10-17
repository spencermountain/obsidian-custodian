import type { AstNode } from '../../../../types/ast.ts'
import { walk, plainText } from '../../../../parse/syntax/_lib.ts'

// Convert inline notes to standard footnotes so numbering and backlinks are shared.
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
  const identifiers = new Set<string>()
  const headingTargets = new Set<string>()
  walk(root, (node) => {
    if (node.identifier) {
      identifiers.add(String(node.identifier).toUpperCase())
    }
    if (node.type === 'wikiLink' && !node.target && node.heading) {
      headingTargets.add(node.heading)
    }
  })
  const notes: AstNode[] = []
  let next = 0
  walk(root, (node) => {
    if (node.type === 'heading' && headingTargets.has(plainText(node))) {
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id: plainText(node) } }
    }
    if (node.type !== 'inlineFootnote') {
      return
    }
    let identifier = 'obsidian-inline-' + ++next
    for (; identifiers.has(identifier.toUpperCase()); identifier = 'obsidian-inline-' + ++next) {
      // Skip identifiers already used by named footnotes.
    }
    identifiers.add(identifier.toUpperCase())
    const content = node.children || []
    notes.push({ type: 'footnoteDefinition', identifier, children: [{ type: 'paragraph', children: content }] })
    node.type = 'footnoteReference'
    node.identifier = identifier
    delete node.children
  })
  root.children.push(...notes)
  return root
}

export default prepare

import protectHtml from './html.js'
import { walk } from './_lib.js'
import callout from './_lib/callout.js'
import { task, blockId, attachBlockIds } from './_lib/blocks.js'

const transform = (tree, parse, source) => {
  // Collapse HTML before visiting its contents: Obsidian treats those as literal.
  protectHtml(tree, source)
  // Original source distinguishes escaped markers from decoded text nodes.
  const raw = (node) => source?.slice(node.position?.start.offset, node.position?.end.offset)

  walk(tree, (node) => {
    if (node.type === 'highlight' && node.value !== undefined) {
      // Highlights start as raw text; parse their enclosed inline Markdown now.
      const parsed = parse(node.value)
      node.children = parsed.children[0]?.children || [{ type: 'text', value: node.value }]
      delete node.value
      // These positions belong to the fragment, not the original document.
      walk(node, (child) => { if (child !== node) { delete child.position } })
    }
    if (node.type === 'blockquote' && !raw(node)?.match(/^>\s*\\/)) {
      callout(node)
    }
    if (node.type === 'listItem') {
      task(node, raw)
    }
    if (node.type === 'paragraph') {
      blockId(node, raw, source !== undefined)
    }
  })
  // Associate standalone IDs after every paragraph has been inspected.
  walk(tree, attachBlockIds)
  return tree
}

export default transform

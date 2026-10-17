import colors from './_lib/colors.ts'
import type { MarkdownNode, DocumentNode } from '../../types/types.ts'
import protectHtml from './html.ts'
import { walk } from './_lib.ts'
import callout from './_lib/callout.ts'
import { task, blockId, attachBlockIds } from './_lib/blocks.ts'

const transform = (tree: MarkdownNode, parse: (input: string) => DocumentNode, source?: string) => {
  // Collapse HTML before visiting its contents: Obsidian treats those as literal.
  protectHtml(tree, source)
  // Original source distinguishes escaped markers from decoded text nodes.
  const raw = (node: MarkdownNode) =>
    source?.slice(node.position?.start.offset, node.position?.end.offset)

  walk(tree, (node) => {
    if (['highlight', 'inlineFootnote', 'commentTail'].includes(node.type) && node.value !== undefined) {
      // Parse the inline contents of custom containers after their boundaries are known.
      let value = node.value
      if (node.type === 'highlight') {
        const emoji = Object.keys(colors).find((marker) => value.startsWith(marker))
        if (emoji) {
          node.color = colors[emoji]
          value = value.slice(emoji.length)
        }
      }
      // A plain prefix forces inline parsing even for contents beginning with # or -.
      const parsed = parse('x ' + value)
      protectHtml(parsed, 'x ' + value)
      node.children = parsed.children[0].children
      node.children[0].value = node.children[0].value.slice(2)
      if (node.type === 'commentTail') { node.type = 'paragraph' }
      delete node.value
      // These positions belong to the fragment, not the original document.
      walk(node, (child) => {
        if (child !== node) {
          delete child.position
        }
      })
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

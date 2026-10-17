import type { MarkdownNode } from '../../types.ts'
import { walk } from './_lib.ts'

// Obsidian leaves Markdown inside HTML elements uninterpreted.
const protectHtml = (tree: MarkdownNode, source?: string) => {
  if (source === undefined) { return }
  walk(tree, (node) => {
    if (!node.children) { return }
    for (let i = 0; i < node.children.length; i += 1) {
      const first = node.children[i]
      const opening = first.type === 'html' && /^<([A-Za-z][\w:-]*)(?:\s[^>]*)?>$/.exec(first.value!)
      if (!opening || /\/>$/.test(first.value!)) { continue }
      let depth = 1
      // Count matching nested tags before collapsing the original source span.
      for (let j = i + 1; j < node.children.length; j += 1) {
        const last = node.children[j]
        if (last.type !== 'html') { continue }
        const tag = /^<(\/?)([A-Za-z][\w:-]*)(?:\s[^>]*)?>$/.exec(last.value!)
        if (!tag || tag[2].toLowerCase() !== opening[1].toLowerCase()) { continue }
        depth += tag[1] ? -1 : 1
        if (depth === 0) {
          const position = { start: first.position!.start, end: last.position!.end }
          // Preserve the exact markup rather than reserializing its parsed children.
          node.children.splice(i, j - i + 1, {
            type: 'html', value: source.slice(position.start.offset, position.end.offset), position
          })
          break
        }
      }
    }
  })
}

export default protectHtml

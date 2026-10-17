import type { Join } from 'mdast-util-to-markdown'
import type { MarkdownNode } from '../../../types/types.ts'
import { walk } from '../_lib.ts'

// Capture gaps before transforms remove positions or split callout paragraphs.
const captureSpacing = (tree: MarkdownNode) => {
  walk(tree, (parent) => {
    if (!['root', 'blockquote', 'list', 'listItem', 'footnoteDefinition'].includes(parent.type)) {
      return
    }
    parent.children?.forEach((node, index, siblings) => {
      const previous = siblings[index - 1]
      const start = node.position?.start.line
      const end = previous?.position?.end.line
      if (start !== undefined && end !== undefined && start > end + 1) {
        node.data = { ...node.data, blankLinesBefore: start - end - 1 }
      }
    })
  })
}

const joinSpacing: Join = (left, right, parent, state) => {
  const count = (right as unknown as MarkdownNode).data?.blankLinesBefore
  if (!(count > 1)) {
    return
  }
  // Keep remark's protective separators where blank lines alone are unsafe.
  for (let index = 0; index < state.join.length; index += 1) {
    const join = state.join[index]
    if (join !== joinSpacing && join(left, right, parent, state) === false) {
      return false
    }
  }
  return count
}

export { captureSpacing, joinSpacing }

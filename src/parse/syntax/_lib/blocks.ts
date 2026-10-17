import type { AstNode } from '../../../types/ast.ts'
type Raw = (node: AstNode) => string | undefined
import { plainText } from '../_lib.ts'

const task = (node: AstNode, raw: Raw) => {
  const first = node.children![0]?.children?.[0]
  const match = first?.type === 'text' && /^\[([^\]\s])\][ \t]+/.exec(first.value!)
  // GFM already handles [x] and [ ]; Obsidian accepts other checked markers.
  if (node.checked == null && match && !raw(first)?.startsWith('\\')) {
    node.checked = true
    node.taskMarker = match[1]
    first.value! = first.value!.slice(match[0].length)
  }
}

const blockId = (node: AstNode, raw: Raw, hasSource: boolean) => {
  const last = node.children!.at(-1)
  const pattern = /(?:^|[ \t\n])\^([a-zA-Z0-9-]+)$/
  const match = last?.type === 'text' && pattern.exec(last.value!)
  if (!match) {
    return
  }
  // Check the original text too: Markdown has already decoded backslash escapes.
  if (hasSource && !pattern.test(raw(last) ?? '')) {
    return
  }
  last.value! = last.value!.slice(0, match.index)
  // Keep a serializable marker as well as metadata for block lookup.
  node.children!.push({ type: 'blockId', value: match[1] })
  node.blockId = match[1]
}

const attachBlockIds = (node: AstNode) => {
  node.children?.forEach((child, index) => {
    if (child.type !== 'paragraph' || !child.blockId) {
      return
    }
    if (plainText(child).replace(child.blockId, '').trim()) {
      return
    }
    // A standalone ^id refers to the preceding list, quote, table, or paragraph.
    const previous = node.children![index - 1]
    if (previous) {
      previous.blockId = child.blockId
    }
  })
}

export { task, blockId, attachBlockIds }

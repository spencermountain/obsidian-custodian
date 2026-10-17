import protectHtml from './html.js'
import { plainText, walk } from './_lib.js'

const callout = (node) => {
  const paragraph = node.children[0]
  const first = paragraph?.children?.[0]
  if (first?.type !== 'text') { return }
  const match = /^\[!([\w-]+)\]([+-]?)[ \t]*/.exec(first.value)
  if (!match) { return }
  first.value = first.value.slice(match[0].length)
  const title = []
  const body = []
  let inBody = false
  paragraph.children.forEach((child) => {
    if (!inBody && child.type === 'text' && /[\r\n]/.test(child.value)) {
      const index = child.value.search(/[\r\n]/)
      title.push({ ...child, value: child.value.slice(0, index) })
      body.push({ ...child, value: child.value.slice(index).replace(/^\r?\n/, '') })
      inBody = true
    } else if (inBody) { body.push(child) } else { title.push(child) }
  })
  node.type = 'callout'
  node.calloutType = match[1].toLowerCase()
  node.fold = null
  if (match[2]) { node.fold = match[2] === '-' ? 'collapsed' : 'expanded' }
  node.title = title
  node.children = node.children.slice(1)
  if (body.length) { node.children.unshift({ type: 'paragraph', children: body }) }
}

const transform = (tree, processor, source) => {
  protectHtml(tree, source)
  const raw = (node) => source?.slice(node.position?.start.offset, node.position?.end.offset)
  walk(tree, (node) => {
    if (node.type === 'highlight' && node.value !== undefined) {
      const parsed = processor.parse(node.value)
      node.children = parsed.children[0]?.children || [{ type: 'text', value: node.value }]
      delete node.value
      walk(node, (child) => { if (child !== node) { delete child.position } })
    }
    if (node.type === 'blockquote' && !raw(node)?.match(/^>\s*\\/)) { callout(node) }
    if (node.type === 'listItem') {
      const first = node.children[0]?.children?.[0]
      const match = first?.type === 'text' && /^\[([^\]\s])\][ \t]+/.exec(first.value)
      if (node.checked == null && match && !raw(first)?.startsWith('\\')) {
        node.checked = true
        node.taskMarker = match[1]
        first.value = first.value.slice(match[0].length)
      }
    }
    if (node.type === 'paragraph') {
      const last = node.children.at(-1)
      const match = last?.type === 'text' && /(?:^|[ \t\n])\^([a-zA-Z0-9-]+)$/.exec(last.value)
      if (match && (source === undefined || /(?:^|[ \t\n])\^[a-zA-Z0-9-]+$/.test(raw(last)))) {
        last.value = last.value.slice(0, match.index)
        node.children.push({ type: 'blockId', value: match[1] })
        node.blockId = match[1]
      }
    }
  })
  walk(tree, (node) => {
    node.children?.forEach((child, index) => {
      if (child.type === 'paragraph' && child.blockId && !plainText(child).replace(child.blockId, '').trim()) {
        const previous = node.children[index - 1]
        if (previous) { previous.blockId = child.blockId }
      }
    })
  })
  return tree
}

export default transform

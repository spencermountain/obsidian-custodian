import type { MarkdownNode, OutputOptions } from '../types/types.ts'
// Extract tree content without trimming, collapsing whitespace, or resolving embeds.
const text = (node: MarkdownNode | null, options: OutputOptions = {}): string => {
  if (!node) {
    return ''
  }
  // Hidden syntax is opt-in for text, even when it remains in the output tree.
  if (node.type === 'comment' && options.comments !== true) {
    return ''
  }
  if (node.type === 'blockId' && options.blockIds !== true) {
    return ''
  }
  if (node.type === 'wikiLink' || node.type === 'embed') {
    return node.alias ?? node.target!
  }
  if (node.type === 'image' || node.type === 'imageReference') {
    return node.alt || ''
  }
  if (node.type === 'break') {
    return '\n'
  }
  if (node.value !== undefined) {
    return node.value
  }

  // Treat the title as a first paragraph without changing the callout's children.
  const children = [...(node.children || [])]
  if (
    node.type === 'callout' &&
    options.calloutTitles !== false &&
    Array.isArray(node.title) &&
    node.title.length
  ) {
    children.unshift({ type: 'paragraph', children: node.title })
  }
  // Supply structural separators only; preserve whitespace within text nodes.
  let separator = ''
  if (['root', 'list', 'listItem', 'blockquote', 'callout', 'table'].includes(node.type)) {
    separator = '\n'
  }
  if (node.type === 'tableRow') {
    separator = '\t'
  }
  return children.map((child) => text(child, options)).join(separator)
}

export default text

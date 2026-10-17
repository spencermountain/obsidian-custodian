// Extract tree content without trimming, collapsing whitespace, or resolving embeds.
const text = (node, options = {}) => {
  if (!node) { return '' }
  if (node.type === 'comment' && options.comments !== true) { return '' }
  if (node.type === 'blockId' && options.blockIds !== true) { return '' }
  if (node.type === 'wikiLink' || node.type === 'embed') { return node.alias ?? node.target }
  if (node.type === 'image' || node.type === 'imageReference') { return node.alt || '' }
  if (node.type === 'break') { return '\n' }
  if (node.value !== undefined) { return node.value }

  const children = [...(node.children || [])]
  if (node.type === 'callout' && options.calloutTitles !== false && node.title?.length) {
    children.unshift({ type: 'paragraph', children: node.title })
  }
  let separator = ''
  if (['root', 'list', 'listItem', 'blockquote', 'callout', 'table'].includes(node.type)) {
    separator = '\n'
  }
  if (node.type === 'tableRow') { separator = '\t' }
  return children.map((child) => text(child, options)).join(separator)
}

export default text

const dimensions = (value = '') => {
  const match = /^(\d+)(?:x(\d+))?$/.exec(value)
  if (!match) { return {} }
  const result = { width: Number(match[1]) }
  if (match[2]) { result.height = Number(match[2]) }
  return result
}

const wikiFields = (value) => {
  const pipe = value.indexOf('|')
  const destination = pipe < 0 ? value : value.slice(0, pipe)
  const hash = destination.indexOf('#')
  const result = { target: destination, alias: null, heading: null, block: null }
  if (pipe >= 0) { result.alias = value.slice(pipe + 1) }
  if (hash >= 0) {
    result.target = destination.slice(0, hash)
    const fragment = destination.slice(hash + 1)
    if (fragment.startsWith('^')) { result.block = fragment.slice(1) } else { result.heading = fragment }
  }
  return result
}

const wikiMarkdown = (node) => {
  let value = node.target
  if (node.heading !== null) { value += `#${node.heading}` }
  if (node.block !== null) { value += `#^${node.block}` }
  if (node.alias !== null) { value += `|${node.alias}` }
  return `${node.type === 'embed' ? '!' : ''}[[${value}]]`
}

const walk = (node, visit, parent = null) => {
  visit(node, parent)
  node.children?.forEach((child) => walk(child, visit, node))
  node.title?.forEach?.((child) => walk(child, visit, node))
}

const plainText = (node) => {
  if (node.type === 'comment' || node.type === 'blockId') { return '' }
  if (node.type === 'wikiLink' || node.type === 'embed') { return node.alias ?? node.target }
  if (node.type === 'image') { return node.alt || '' }
  if (node.value !== undefined) { return node.value }
  const separator = ['root', 'list', 'listItem', 'blockquote', 'callout'].includes(node.type) ? '\n' : ''
  return (node.children || []).map(plainText).join(separator)
}

export { dimensions, wikiFields, wikiMarkdown, walk, plainText }

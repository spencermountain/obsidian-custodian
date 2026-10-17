const text = (value, key) => {
  if (typeof value !== 'string') { throw new TypeError(`${key} must be a string`) }
}
const fields = {
  heading: ['text', 'depth'], paragraph: ['text'],
  wikiLink: ['target', 'alias', 'heading', 'block'],
  embed: ['target', 'alias', 'heading', 'block'],
  link: ['url', 'text', 'title'], image: ['url', 'alt', 'title'],
  listItem: ['checked'], callout: ['title', 'calloutType', 'fold'],
  code: ['value', 'lang', 'meta'], math: ['value'], inlineMath: ['value'],
  comment: ['value'], highlight: ['text'], yaml: ['value']
}

const edit = (node, changes) => {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) { throw new TypeError('Expected an update object') }
  const next = structuredClone(node)
  Object.entries(changes).forEach(([key, value]) => {
    if (!fields[node.type]?.includes(key)) { throw new TypeError(`Cannot update ${key} on ${node.type}`) }
    if (key === 'depth') {
      if (!Number.isInteger(value) || value < 1 || value > 6) { throw new RangeError('Heading depth must be 1–6') }
    } else if (key === 'checked') {
      if (typeof value !== 'boolean' || typeof node.checked !== 'boolean') { throw new TypeError('checked requires a task and a boolean') }
      delete next.taskMarker
    } else if (key === 'fold') {
      if (![null, 'expanded', 'collapsed'].includes(value)) { throw new TypeError('Invalid callout fold') }
    } else if (value !== null || !['alias', 'heading', 'block', 'title', 'lang', 'meta'].includes(key)) {
      text(value, key)
    }
    if (node.type === 'heading' && key === 'text' && /[\r\n]/.test(value)) { throw new TypeError('Heading text must be one line') }
    if (['wikiLink', 'embed'].includes(node.type) && value !== null) {
      if (/[\[\]\r\n|\\]/.test(value) || value.includes('%%') || (key === 'target' && /[#^]/.test(value))) {
        throw new TypeError(`Invalid ${key}`)
      }
      if (key === 'block' && !/^[A-Za-z0-9-]+$/.test(value)) { throw new TypeError('Invalid block identifier') }
    }
    if (key === 'calloutType' && !/^[\w-]+$/.test(value)) { throw new TypeError('Invalid calloutType') }
    if (node.type === 'comment' && value.includes('%%')) { throw new TypeError('Comment value cannot contain %%') }
    if (node.type === 'callout' && key === 'title') {
      if (typeof value !== 'string' || /[\r\n]/.test(value)) { throw new TypeError('Callout title must be one line') }
      next.title = [{ type: 'text', value }]
    } else if (key === 'text') {
      next.children = [{ type: 'text', value }]
      if (node.blockId) { next.children.push({ type: 'blockId', value: node.blockId }) }
    } else { next[key] = value }
  })
  if (next.heading !== undefined && next.heading !== null && next.block !== null) { throw new TypeError('Use either heading or block') }
  if (['wikiLink', 'embed'].includes(node.type) && !next.target && !next.heading && !next.block) { throw new TypeError('A link needs a target or fragment') }
  return next
}

export default edit

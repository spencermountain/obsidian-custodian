import { dimensions, plainText } from '../syntax/_lib.js'

const groups = {
  headings: (node) => node.type === 'heading',
  paragraphs: (node) => node.type === 'paragraph',
  links: (node) => ['wikiLink', 'link', 'linkReference'].includes(node.type),
  embeds: (node) => ['embed', 'image', 'imageReference'].includes(node.type),
  tasks: (node) => node.type === 'listItem' && typeof node.checked === 'boolean',
  lists: (node) => node.type === 'list',
  callouts: (node) => node.type === 'callout',
  highlights: (node) => node.type === 'highlight',
  comments: (node) => node.type === 'comment',
  code: (node) => node.type === 'code',
  math: (node) => ['math', 'inlineMath'].includes(node.type),
  tables: (node) => node.type === 'table',
  frontmatter: (node) => node.type === 'yaml',
  footnotes: (node) => node.type === 'footnoteDefinition'
}

const json = (node) => {
  const result = { type: node.type, text: plainText(node) }
  const fields = ['depth', 'target', 'alias', 'heading', 'block', 'url', 'alt', 'checked', 'taskMarker', 'ordered', 'start', 'lang', 'meta', 'value', 'identifier', 'label', 'blockId', 'calloutType', 'fold']
  fields.forEach((key) => { if (node[key] !== undefined) { result[key] = node[key] } })
  if (node.position) { result.position = structuredClone(node.position) }
  if (node.type === 'comment') { result.text = node.value }
  if (node.type === 'callout') { result.title = plainText({ children: node.title }) }
  if (node.type === 'embed') { Object.assign(result, dimensions(node.alias ?? '')) }
  if (node.type === 'image') { Object.assign(result, dimensions((node.alt || '').split('|').at(-1))) }
  if (node.type === 'table') {
    result.align = [...node.align]
    result.rows = node.children.map((row) => row.children.map(plainText))
  }
  if (node.type === 'list') {
    result.items = node.children.map((item) => ({ text: plainText(item), checked: item.checked ?? null }))
  }
  return result
}

export { groups, json }

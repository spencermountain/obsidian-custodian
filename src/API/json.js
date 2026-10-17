import text from './text.js'
import { dimensions } from '../parse/syntax/_lib.js'

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

const json = (node, options = {}) => {
  const result = { type: node.type, text: text(node, options) }
  const fields = [
    'depth',
    'target',
    'alias',
    'heading',
    'block',
    'url',
    'alt',
    'checked',
    'taskMarker',
    'ordered',
    'start',
    'lang',
    'meta',
    'value',
    'identifier',
    'label',
    'blockId',
    'calloutType',
    'fold'
  ]
  fields.forEach((key) => {
    if (node[key] !== undefined) {
      result[key] = node[key]
    }
  })
  if (node.position) {
    result.position = structuredClone(node.position)
  }
  if (node.type === 'comment') {
    result.text = node.value
  }
  if (node.type === 'callout') {
    result.title = text({ children: node.title }, options)
  }
  if (node.type === 'embed') {
    Object.assign(result, dimensions(node.alias ?? ''))
  }
  if (node.type === 'image') {
    Object.assign(result, dimensions((node.alt || '').split('|').at(-1)))
  }
  if (node.type === 'table') {
    result.align = [...node.align]
    result.rows = node.children.map((row) => row.children.map((cell) => text(cell, options)))
  }
  if (node.type === 'list') {
    result.items = node.children.map((item) => ({
      text: text(item, options),
      checked: item.checked ?? null
    }))
  }
  return result
}

export { groups, json }

import text from './text.ts'
import properties from './properties.ts'
import { normalize } from './ast/references.ts'
import type {
  MarkdownNode,
  NodeJSON,
  OutputOptions
} from '../types/types.ts'
import { dimensions } from '../parse/syntax/_lib.ts'

// Common metadata; specialized sections can extend this output.
const serialize = (node: MarkdownNode, options: OutputOptions = {}, definitions: Map<string, any> = new Map()): NodeJSON => {
  const result: NodeJSON = { type: node.type, text: text(node, options) }
  if (node.type === 'yaml') { Object.assign(result, properties(node.value)) }
  if (['linkReference', 'imageReference'].includes(node.type)) {
    const definition = definitions.get(normalize(node.identifier))
    if (definition) {
      result.url = definition.url
      if (definition.title != null) { result.title = definition.title }
    }
  }
  // Copy public metadata explicitly instead of leaking nested AST internals.
  const fields: Array<keyof NodeJSON & keyof MarkdownNode> = [
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
    'fold',
    'color'
  ]
  fields.forEach((key) => {
    if (node[key] !== undefined) {
      Object.assign(result, { [key]: node[key] })
    }
  })
  if (typeof node.title === 'string') { result.title = node.title }
  if (node.position) {
    result.position = structuredClone(node.position)
  }
  // Direct comment inspection exposes its content even when document text omits it.
  if (node.type === 'comment') {
    result.text = node.value!
  }
  // Size hints occupy the alias in embeds and the final alt-text segment in images.
  if (node.type === 'embed') {
    Object.assign(result, dimensions(node.alias ?? ''))
    if (/\.pdf$/i.test(node.target)) {
      const params = new URLSearchParams(node.heading || '')
      const fields = ['page', 'height']
      fields.forEach((key) => {
        const value = params.get(key)
        if (value && /^[1-9]\d*$/.test(value)) { result[key] = Number(value) }
      })
    }
  }
  if (node.type === 'image') {
    Object.assign(result, dimensions((node.alt || '').split('|').at(-1)))
  }
  // Flatten cells into rows so consumers need not traverse table nodes.
  if (node.type === 'table') {
    result.align = [...node.align!]
    result.rows = node.children!.map((row) => row.children!.map((cell) => text(cell, options)))
  }
  if (node.type === 'list') {
    result.items = node.children!.map((item) => ({
      text: text(item, options),
      checked: item.checked ?? null
    }))
  }
  return result
}

export default serialize

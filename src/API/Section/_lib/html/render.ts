import { walk } from '../../../../parse/syntax/_lib.ts'
import { normalize } from '../../../ast/references.ts'
import { createSection } from '../../registry.ts'
import footnotes from './footnotes.ts'

const render = (root, options) => {
  const definitions = new Map()
  const notes = new Map()
  walk(root, (node) => {
    if (['definition', 'footnoteDefinition'].includes(node.type)) {
      const map = node.type === 'definition' ? definitions : notes
      const key = normalize(node.identifier)
      if (!map.has(key)) {
        map.set(key, node)
      }
    }
  })
  const state = {
    root,
    notes,
    inlineCount: 0,
    options,
    definitions,
    footnotes: null,
    render: (node, parent = null): string => createSection(node).html(options, state, parent),
    all: (node, separator = ''): string => (node.children || [])
      .map(child => state.render(child, node))
      .filter(value => value !== '')
      .join(separator)
  }
  state.footnotes = footnotes(notes, node => state.all(node, '\n'))
  const body = state.render(root)
  const footer = state.footnotes.footer()
  return [body, footer].filter(Boolean).join('\n')
}

export default render

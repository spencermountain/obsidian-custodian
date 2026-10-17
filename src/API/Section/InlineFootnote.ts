import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import renderText from './_lib/text.ts'
import { normalize } from '../ast/references.ts'

class InlineFootnote extends Section {
  json(options: JsonOptions = {}) {
    return super.json(options)
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    return (node.children || []).map(child => renderText(child, options)).join('')
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    const node = this.node
    let identifier = 'obsidian-inline-' + ++state.inlineCount
    for (; state.notes.has(normalize(identifier)); identifier = 'obsidian-inline-' + ++state.inlineCount) {
      // Keep generated identifiers distinct from named notes.
    }
    state.notes.set(normalize(identifier), {
      type: 'footnoteDefinition',
      identifier,
      children: [{ type: 'paragraph', children: node.children || [] }]
    })
    return state.render({ type: 'footnoteReference', identifier })
  }
}

export default InlineFootnote

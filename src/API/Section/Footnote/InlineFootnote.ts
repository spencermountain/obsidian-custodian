import Section from '../Section.ts'
import { normalize } from '../../ast/references.ts'

class InlineFootnote extends Section {
  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return (node.children || []).map(child => this.renderText(child)).join('')
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
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

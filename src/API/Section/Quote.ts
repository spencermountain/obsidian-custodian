import Section from './Section.ts'
import { element } from './_lib/html/elements.ts'

class Quote extends Section {
  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return (node.children || []).map(child => this.renderText(child)).join('\n')
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    return element('blockquote', {}, state.all(node, '\n'))
  }
}

export default Quote

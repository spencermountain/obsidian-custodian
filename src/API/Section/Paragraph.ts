import Section from './Section.ts'
import { element } from './_lib/html/elements.ts'

class Paragraph extends Section {
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
    return element('p', {}, state.all(node))
  }
}

export default Paragraph

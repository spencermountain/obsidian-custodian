import Section from './Section.ts'
import { element } from './_lib/html/elements.ts'

class TableCell extends Section {
  json(setting?: boolean) {
    return super.json(setting)
  }

  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return (node.children || []).map(child => this.renderText(child)).join('')
  }

  html(setting?: boolean): string {
    const state = this.context.html
    const parent = this.context.parent
    if (!state) { return super.html(setting) }
    const node = this.node
    const align = parent?.align
    const properties = ['left', 'center', 'right'].includes(align) ? { align } : {}
    return element(parent?.header ? 'th' : 'td', properties, state.all(node))
  }
}

export default TableCell

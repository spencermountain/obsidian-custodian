import Section from './Section.ts'
import { element } from './_lib/html/elements.ts'

class TableRow extends Section {
  json(setting?: boolean) {
    return super.json(setting)
  }

  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return (node.children || []).map(child => this.renderText(child)).join('\t')
  }

  html(setting?: boolean): string {
    const state = this.context.html
    const parent = this.context.parent
    if (!state) { return super.html(setting) }
    const node = this.node
    const header = parent?.children?.indexOf(node) === 0
    const cells = (node.children || []).map((cell, column) => state.render(cell, {
      type: 'tableRow', header, align: parent?.align?.[column]
    }))
    return element('tr', {}, cells)
  }
}

export default TableRow

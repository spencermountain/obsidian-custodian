import Section from '../Section.ts'
import { element } from '../_lib/html/elements.ts'

class Table extends Section {
  json(setting?: boolean) {
    const result = super.json(setting)
    if (!result) { return null }
    const node = this.jsonNode(setting)
    result.align = [...node.align]
    result.rows = node.children.map(row => row.children.map(cell => this.jsonText(cell)))
    return result
  }

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
    const rows = (node.children || []).map(row => state.render(row, node))
    const header = rows.length ? element('thead', {}, rows[0]) : ''
    const body = rows.length > 1 ? element('tbody', {}, rows.slice(1)) : ''
    return element('table', {}, header + body)
  }
}

export default Table

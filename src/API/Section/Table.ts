import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import jsonDefaults from '../out/json.ts'
import renderText, { jsonText } from './_lib/text.ts'
import { element } from './_lib/html/elements.ts'

class Table extends Section {
  json(options: JsonOptions = {}) {
    const result = super.json(options)
    if (!result) { return null }
    const node = outputTree(this.node, { ...jsonDefaults, ...options })
    result.align = [...node.align]
    result.rows = node.children.map(row => row.children.map(cell => jsonText(cell, options)))
    return result
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    return (node.children || []).map(child => renderText(child, options)).join('\n')
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    const node = this.node
    const rows = (node.children || []).map(row => state.render(row, node))
    const header = rows.length ? element('thead', {}, rows[0]) : ''
    const body = rows.length > 1 ? element('tbody', {}, rows.slice(1)) : ''
    return element('table', {}, header + body)
  }
}

export default Table

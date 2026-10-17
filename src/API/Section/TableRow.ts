import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import renderText from './_lib/text.ts'
import { element } from './_lib/html/elements.ts'

class TableRow extends Section {
  json(options: JsonOptions = {}) {
    return super.json(options)
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    return (node.children || []).map(child => renderText(child, options)).join('\t')
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    const node = this.node
    const header = parent?.children?.indexOf(node) === 0
    const cells = (node.children || []).map((cell, column) => state.render(cell, {
      type: 'tableRow', header, align: parent?.align?.[column]
    }))
    return element('tr', {}, cells)
  }
}

export default TableRow

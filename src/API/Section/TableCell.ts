import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import renderText from './_lib/text.ts'
import { element } from './_lib/html/elements.ts'

class TableCell extends Section {
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
    const align = parent?.align
    const properties = ['left', 'center', 'right'].includes(align) ? { align } : {}
    return element(parent?.header ? 'th' : 'td', properties, state.all(node))
  }
}

export default TableCell

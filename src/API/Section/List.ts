import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import jsonDefaults from '../out/json.ts'
import renderText, { jsonText } from './_lib/text.ts'
import metadata from './_lib/metadata.ts'
import { element } from './_lib/html/elements.ts'

class List extends Section {
  json(options: JsonOptions = {}) {
    const result = metadata(super.json(options), this.node, ['ordered', 'start'])
    if (!result) { return null }
    const node = outputTree(this.node, { ...jsonDefaults, ...options })
    result.items = node.children.map(item => ({ text: jsonText(item, options), checked: item.checked ?? null }))
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
    const tasks = node.children.some(child => typeof child.checked === 'boolean')
    const properties: Record<string, any> = {}
    if (tasks) {
      properties.className = 'contains-task-list'
    }
    if (node.ordered && node.start !== 1 && node.start != null) {
      properties.start = node.start
    }
    return element(node.ordered ? 'ol' : 'ul', properties, state.all(node))
  }
}

export default List

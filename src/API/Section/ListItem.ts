import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import renderText from './_lib/text.ts'
import metadata from './_lib/metadata.ts'
import { element } from './_lib/html/elements.ts'

class ListItem extends Section {
  json(options: JsonOptions = {}) {
    return metadata(super.json(options), this.node, ['checked', 'taskMarker'])
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
    const properties: Record<string, any> = {}
    let checkbox = ''
    if (typeof node.checked === 'boolean') {
      properties.className = 'task-list-item'
      checkbox = element('input', { type: 'checkbox', disabled: true, checked: node.checked }) + ' '
    }
    // Tight lists omit paragraph wrappers; loose lists retain their block structure.
    const loose = parent?.spread || parent?.children?.some(child => child.spread)
    const children = (node.children || []).map((child, index) => {
      const prefix = index === 0 ? checkbox : ''
      if (child.type === 'paragraph') {
        const content = prefix + state.all(child)
        return loose ? element('p', {}, content) : content
      }
      return prefix + state.render(child, node)
    })
    return element('li', properties, children.join('\n'))
  }
}

export default ListItem

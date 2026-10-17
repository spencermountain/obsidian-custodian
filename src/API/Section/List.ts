import Section from './Section.ts'
import metadata from './_lib/metadata.ts'
import { element } from './_lib/html/elements.ts'

class List extends Section {
  json(setting?: boolean) {
    const result = metadata(super.json(setting), this.node, ['ordered', 'start'])
    if (!result) { return null }
    const node = this.jsonNode(setting)
    result.items = node.children.map(item => ({ text: this.jsonText(item), checked: item.checked ?? null }))
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

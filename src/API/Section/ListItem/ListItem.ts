import Section from '../Section.ts'
import listItem from './_lib.ts'
import { element } from '../_lib/html/elements.ts'

class ListItem extends Section {
  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return (node.children || []).map(child => this.renderText(child)).join('\n')
  }

  html(setting?: boolean): string {
    const state = this.context.html
    const parent = this.context.parent
    if (!state) { return super.html(setting) }
    return element('li', {}, listItem(this.node, state, parent))
  }
}

export default ListItem

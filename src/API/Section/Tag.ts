import Section from './Section.ts'
import metadata from './_lib/metadata.ts'
import { element, text as escape } from './_lib/html/elements.ts'

class Tag extends Section {
  json(setting?: boolean) {
    return metadata(super.json(setting), this.node, ['value'])
  }

  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return '#' + node.value
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    return element('span', { className: 'tag' }, escape('#' + node.value))
  }
}

export default Tag

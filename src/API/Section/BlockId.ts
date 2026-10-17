import Section from './Section.ts'
import metadata from './_lib/metadata.ts'
import { element } from './_lib/html/elements.ts'

class BlockId extends Section {
  json(setting?: boolean) {
    return metadata(super.json(setting), this.node, ['value'])
  }

  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) {
      return ''
    }
    return node.value ?? ''
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) {
      return super.html(setting)
    }
    const node = this.node
    return element('span', { id: 'user-content-block-' + node.value })
  }
}

export default BlockId

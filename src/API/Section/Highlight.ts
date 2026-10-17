import Section from './Section.ts'
import type { TextOptions } from '../../types/options.ts'
import metadata from './_lib/metadata.ts'
import { element } from './_lib/html/elements.ts'

class Highlight extends Section {
  json(setting?: boolean) {
    return metadata(super.json(setting), this.node, ['color'])
  }

  text(setting?: TextOptions['highlights']): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return (node.children || []).map(child => this.renderText(child)).join('')
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    return element('mark', { dataColor: node.color }, state.all(node))
  }
}

export default Highlight

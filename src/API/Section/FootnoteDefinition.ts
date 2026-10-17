import Section from './Section.ts'
import metadata from './_lib/metadata.ts'

class FootnoteDefinition extends Section {
  json(setting?: boolean) {
    return metadata(super.json(setting), this.node, ['identifier', 'label'])
  }

  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return (node.children || []).map(child => this.renderText(child)).join('')
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    return ''
  }
}

export default FootnoteDefinition

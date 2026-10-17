import Section from './Section.ts'
import metadata from './_lib/metadata.ts'
import { element, text as escape } from './_lib/html/elements.ts'
import properties from '../properties.ts'

class Frontmatter extends Section {
  json(setting?: boolean) {
    const result = metadata(super.json(setting), this.node, ['value'])
    return result ? Object.assign(result, properties(this.node.value)) : null
  }

  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return node.value ?? ''
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    return element('pre', {}, element('code', { className: 'language-yaml' }, escape(node.value)))
  }
}

export default Frontmatter

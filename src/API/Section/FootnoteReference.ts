import Section from './Section.ts'
import metadata from './_lib/metadata.ts'
import { element, text as escape } from './_lib/html/elements.ts'

class FootnoteReference extends Section {
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
    const reference = state.footnotes.reference(node)
    if (!reference) { return escape('[^' + node.identifier + ']') }
    return element('sup', {}, element('a', {
      href: reference.href,
      id: reference.id,
      'data-footnote-ref': '',
      'aria-describedby': 'user-content-footnote-label'
    }, String(reference.number)))
  }
}

export default FootnoteReference

import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import renderText from './_lib/text.ts'
import metadata from './_lib/metadata.ts'
import { element, text as escape } from './_lib/html/elements.ts'

class FootnoteReference extends Section {
  json(options: JsonOptions = {}) {
    return metadata(super.json(options), this.node, ['identifier', 'label'])
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    return (node.children || []).map(child => renderText(child, options)).join('')
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
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

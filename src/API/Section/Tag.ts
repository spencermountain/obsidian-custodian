import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import metadata from './_lib/metadata.ts'
import { element, text as escape } from './_lib/html/elements.ts'

class Tag extends Section {
  json(options: JsonOptions = {}) {
    return metadata(super.json(options), this.node, ['value'])
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    return '#' + node.value
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    const node = this.node
    return element('span', { className: 'tag' }, escape('#' + node.value))
  }
}

export default Tag

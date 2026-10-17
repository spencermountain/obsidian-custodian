import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import metadata from './_lib/metadata.ts'
import { text as escape } from './_lib/html/elements.ts'

class Comment extends Section {
  json(options: JsonOptions = {}) {
    const result = metadata(super.json(options), this.node, ['value'])
    if (result) { result.text = this.node.value }
    return result
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    return node.value ?? ''
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    const node = this.node
    // Escape markup and double hyphens so content cannot end the HTML comment.
    return '<!-- ' + escape(node.value).replace(/--/g, '-&#45;') + ' -->'
  }
}

export default Comment

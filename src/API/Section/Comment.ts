import Section from './Section.ts'
import metadata from './_lib/metadata.ts'
import { text as escape } from './_lib/html/elements.ts'

class Comment extends Section {
  json(setting?: boolean) {
    const result = metadata(super.json(setting), this.node, ['value'])
    if (result) { result.text = this.node.value }
    return result
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
    // Escape markup and double hyphens so content cannot end the HTML comment.
    return '<!-- ' + escape(node.value).replace(/--/g, '-&#45;') + ' -->'
  }
}

export default Comment

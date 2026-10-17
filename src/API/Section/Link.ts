import type { OutputOptions } from '../../types/types.ts'
import Section from './Section.ts'

class Link extends Section {
  target(): string {
    const node = this.json()
    return node.target ?? node.url ?? ''
  }

  text(options: OutputOptions = {}): string {
    const node = this.ast(options)
    if (!node) { return '' }
    if (node.type !== 'wikiLink') { return super.text(options) }
    if (node.alias != null) { return node.alias }
    const fragment = node.heading ?? (node.block ? '^' + node.block : '')
    return node.target + (node.target && fragment ? '#' : '') + fragment
  }
}

export default Link

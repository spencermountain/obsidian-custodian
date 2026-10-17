import type { OutputOptions } from '../../types/types.ts'
import Section from './Section.ts'

class Embed extends Section {
  text(options: OutputOptions = {}): string {
    const node = this.ast(options)
    if (!node) {
      return ''
    }
    if (node.type === 'embed') {
      return node.alias ?? node.target
    }
    return node.alt || ''
  }
}

export default Embed

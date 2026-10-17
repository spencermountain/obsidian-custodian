import type { TextOptions } from '../../types/options.ts'
import Section from './Section.ts'

class Embed extends Section {
  text(options: TextOptions = {}): string {
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

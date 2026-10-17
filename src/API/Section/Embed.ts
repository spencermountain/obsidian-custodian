import type { TextOptions } from '../../types/options.ts'
import Section from './Section.ts'
import outputTree from '../out/ast/output.ts'
import textDefaults from '../out/text/defaults.ts'

class Embed extends Section {
  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
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

import Section from '../Section.ts'

// Inline formatting wraps child content without changing its plain-text meaning.
class Format extends Section {
  text(setting?: boolean | 'text'): string {
    const node = this.textNode(setting)
    if (!node) { return '' }
    return (node.children || []).map(child => this.renderText(child)).join('')
  }
}

export default Format

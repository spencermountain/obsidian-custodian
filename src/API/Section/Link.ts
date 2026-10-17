import type { DocumentNode } from '../../types/types.ts'
import Section from './Section.ts'

// a [[link]]
class Link extends Section {
  #node: DocumentNode
  constructor(node: DocumentNode) {
    super(node)
  }
  json() {}
  text() {
    return this.#node.text
  }
  html() {
    return `<a href="${this.#node.url}">${this.#node.text}</a>`
  }
}

export default Link

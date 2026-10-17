import type { DocumentNode } from '../../types/types.ts'

// a generic item (a leaf?) of a parse tree
class Section {
  #node: DocumentNode
  #dirty = false

  constructor(node: DocumentNode, parent?: DocumentNode) {
    this.#node = node
  }
  json() {}
  text() {
    return this.#node.text || ''
  }
  html() {}
  ast() {
    return this.#node
  }
  remove() {
    // todo
  }
}

export default Section

import type { DocumentNode } from '../../types/types.ts'
import Section from './Section.ts'

// a [[!image.jpg]]
class Embed extends Section {
  #node: DocumentNode
  constructor(node: DocumentNode) {
    super(node)
  }
  json() {}
  text() {
    return '' //dont show anything for images, etc
  }
  html() {}
}

export default Embed

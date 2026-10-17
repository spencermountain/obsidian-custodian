import renderText from '../text.ts'
import serialize from '../json.ts'
import { definitions } from '../ast/references.ts'
import type { MarkdownNode, OutputOptions, EditChanges, NodeJSON } from '../../types/types.ts'
import type Page from '../Page.ts'
import edit from '../ast/edit.ts'
import outputTree from '../ast/output.ts'

interface SectionContext {
  locate?: (node: MarkdownNode) => MarkdownNode
  changed?: () => void
  page?: Page
}

// Wrap live nodes; output methods read detached, filtered views through ast().
class Section {
  #node: MarkdownNode
  protected context: SectionContext

  constructor(node: MarkdownNode, context: SectionContext = {}) {
    this.#node = node
    this.context = context
  }

  ast(options: OutputOptions = {}) {
    return outputTree(this.#node, options)
  }

  json(options: OutputOptions = {}): NodeJSON | null {
    const node = this.ast(options)
    if (!node) { return null }
    let references = new Map()
    if (this.context.page && ['linkReference', 'imageReference'].includes(node.type)) {
      references = definitions(this.context.page.ast(options))
    }
    return serialize(node, options, references)
  }

  text(options: OutputOptions = {}): string {
    const node = this.ast(options)
    if (!node) {
      return ''
    }
    if (node.type === 'comment' && options.comments !== true) {
      return ''
    }
    if (node.type === 'blockId' && options.blockIds !== true) {
      return ''
    }
    if (node.type === 'tag') {
      return '#' + node.value
    }
    if (node.type === 'break') {
      return '\n'
    }
    if (node.value !== undefined) {
      return node.value
    }
    let separator = ''
    if (['root', 'list', 'listItem', 'blockquote', 'table'].includes(node.type)) {
      separator = '\n'
    }
    if (node.type === 'tableRow') {
      separator = '\t'
    }
    return (node.children || [])
      .map((child) => renderText(child, options))
      .join(separator)
  }

  #owner() {
    if (!this.context.locate || !this.context.changed || !this.context.page) {
      throw new Error('This section is not attached to a page')
    }
    return this.context
  }

  update(changes: EditChanges): this {
    const owner = this.#owner()
    owner.locate(this.#node)
    const next = edit(this.#node, changes)
    // Preserve identity so other sections referencing this node stay valid.
    Object.keys(this.#node).forEach((key) => {
      Reflect.deleteProperty(this.#node, key)
    })
    Object.assign(this.#node, next)
    owner.changed()
    return this
  }

  remove(): Page {
    const owner = this.#owner()
    const parent = owner.locate(this.#node)
    const children = parent.children?.includes(this.#node) ? parent.children : parent.title
    const index = children.indexOf(this.#node)
    const following = children[index + 1]
    children.splice(index, 1)
    // Remove a standalone identifier along with the block it labels.
    if (
      this.#node.blockId &&
      following?.type === 'paragraph' &&
      following.blockId === this.#node.blockId
    ) {
      children.splice(index, 1)
    }
    owner.changed()
    return owner.page
  }
}

export type { SectionContext }
export default Section

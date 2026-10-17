import renderHtml from './_lib/html.ts'
import renderText from './_lib/text.ts'
import { createSection } from './registry.ts'
import type { EditChanges, NodeJSON } from '../../types/api.ts'
import type { TextOptions, AstOptions, JsonOptions, HtmlOptions, MarkdownOptions } from '../../types/options.ts'
import type { AstNode } from '../../types/ast.ts'
import type Page from '../Page.ts'
import edit from '../ast/edit.ts'
import outputTree from '../ast/output.ts'
import stringify from '../../parse/stringify.ts'
import astDefaults from '../out/ast.ts'
import jsonDefaults from '../out/json.ts'
import textDefaults from '../out/text.ts'
import markdownDefaults from '../out/markdown.ts'
import { text as escape } from './_lib/html/elements.ts'

interface SectionContext {
  locate?: (node: AstNode) => AstNode
  changed?: () => void
  page?: Page
}

// Shared ownership, detached views, and metadata. Known syntax renders in subclasses.
class Section {
  #node: AstNode
  protected context: SectionContext

  constructor(node: AstNode, context: SectionContext = {}) {
    this.#node = node
    this.context = context
  }

  protected get node(): AstNode {
    return this.#node
  }

  ast(options: AstOptions = {}) {
    return outputTree(this.#node, { ...astDefaults, ...options })
  }

  json(options: JsonOptions = {}): NodeJSON | null {
    options = { ...jsonDefaults, ...options }
    const node = outputTree(this.#node, options)
    if (!node) { return null }
    const result: NodeJSON = {
      type: node.type,
      text: this.text({ ...options, headings: 'inline', comments: false, blockIds: false })
    }
    if (node.blockId !== undefined) { result.blockId = node.blockId }
    if (node.position) { result.position = structuredClone(node.position) }
    return result
  }

  // Unknown plugin nodes keep a useful fallback without knowing any syntax types.
  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.#node, options)
    if (!node) { return '' }
    if (node.value !== undefined) { return node.value }
    return (node.children || []).map(child => renderText(child, options)).join('')
  }

  html(options: HtmlOptions = {}, state?: any, parent?: AstNode): string {
    if (!state) { return renderHtml(this.#node, options, this.context.page?.ast()) }
    return this.#node.value == null ? state.all(this.#node) : escape(this.#node.value)
  }

  // Markdown syntax remains delegated to remark; subclasses can change their node.
  markdown(options: MarkdownOptions = {}): string {
    const node = this.markdownNode(options)
    return node ? stringify(node as any) : ''
  }

  markdownNode(options: MarkdownOptions = {}): AstNode | null {
    options = { ...markdownDefaults, ...options }
    const node = outputTree(this.#node, options)
    if (!node) { return null }
    if (node.children) {
      node.children = node.children.map(child => createSection(child).markdownNode(options)).filter(Boolean)
    }
    if (Array.isArray(node.title)) {
      node.title = node.title.map(child => createSection(child).markdownNode(options)).filter(Boolean)
    }
    return node
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

import category from './_lib/category.ts'
import htmlDefaults from '../out/html.ts'
import renderHtml from './_lib/html.ts'
import renderText, { jsonText } from './_lib/text.ts'
import markdownTree from './_lib/markdown.ts'
import { definitions, normalize } from '../ast/references.ts'
import type { EditChanges, NodeJSON } from '../../types/api.ts'
import type { TextOptions, JsonOptions, MarkdownOptions } from '../../types/options.ts'
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
  // Output contexts belong to temporary render sections, never live editing handles.
  text?: TextOptions
  json?: JsonOptions
  markdown?: MarkdownOptions
  html?: any
  parent?: AstNode
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

  protected get category(): string { return category(this.#node) }

  ast(setting?: boolean) {
    if (setting === false) { return null }
    const options = { [this.category]: setting ?? astDefaults[this.category] }
    return outputTree(this.#node, { ...astDefaults, ...options })
  }

  protected textNode(setting?: boolean | string) {
    if (setting === false) { return null }
    const options = { ...textDefaults, ...this.context.text }
    if (setting !== undefined) { options[this.category] = setting }
    return outputTree(this.#node, options)
  }

  protected renderText(node: AstNode): string {
    return renderText(node, this.context.text)
  }

  protected jsonNode(setting?: boolean) {
    if (setting === false) { return null }
    const options = { ...jsonDefaults, ...this.context.json }
    if (setting !== undefined) { options[this.category] = setting }
    return outputTree(this.#node, options)
  }

  protected jsonText(node: AstNode): string {
    return jsonText(node, this.context.json)
  }

  protected definition() {
    const page = this.context.page
    return page && definitions(page.ast({ ...jsonDefaults, ...this.context.json })).get(normalize(this.#node.identifier))
  }

  json(setting?: boolean): NodeJSON | null {
    const node = this.jsonNode(setting)
    if (!node) { return null }
    const result: NodeJSON = { type: node.type, text: this.jsonText(node) }
    if (node.blockId !== undefined) { result.blockId = node.blockId }
    if (node.position) { result.position = structuredClone(node.position) }
    return result
  }

  // Unknown plugin nodes keep a useful fallback without knowing any syntax types.
  text(setting?: boolean | 'inline' | 'body' | 'text'): string {
    const node = this.textNode(setting)
    if (!node) { return '' }
    if (node.value !== undefined) { return node.value }
    return (node.children || []).map(child => this.renderText(child)).join('')
  }

  html(setting?: boolean | 'inline' | 'body'): string {
    if (setting === false) { return '' }
    const state = this.context.html
    if (!state) {
      const options = { ...htmlDefaults }
      if (setting !== undefined) { options[this.category] = setting }
      return renderHtml(this.#node, options, this.context.page?.ast())
    }
    return this.#node.value == null ? state.all(this.#node) : escape(this.#node.value)
  }

  // Markdown syntax remains delegated to remark; subclasses can change their node.
  markdown(setting?: boolean | 'inline' | 'body'): string {
    const node = this.markdownNode(setting)
    return node ? stringify(node as any) : ''
  }

  markdownNode(setting?: boolean | 'inline' | 'body'): AstNode | null {
    if (setting === false) { return null }
    const options = { ...markdownDefaults, ...this.context.markdown }
    if (setting !== undefined) { options[this.category] = setting }
    const node = outputTree(this.#node, options)
    if (!node) { return null }
    if (node.children) {
      node.children = node.children.map(child => markdownTree(child, options)).filter(Boolean)
    }
    if (Array.isArray(node.title)) {
      node.title = node.title.map(child => markdownTree(child, options)).filter(Boolean)
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

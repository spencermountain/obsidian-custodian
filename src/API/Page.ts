import type { ParseOptions, PageJSON } from '../types/api.ts'
import type { TextOptions, JsonOptions, MarkdownOptions, AstOptions, HtmlOptions } from '../types/options.ts'
import type { PageNode, Predicate } from '../types/ast.ts'
import parseMd from '../parse/index.ts'
import stringifyMd from '../parse/stringify.ts'
import outputTree from './ast/output.ts'
import text from './Section/_lib/text.ts'
import html from './Section/_lib/html.ts'
import astDefaults from './out/ast.ts'
import jsonDefaults from './out/json.ts'
import markdownDefaults from './out/markdown.ts'
import markdownTree from './Section/_lib/markdown.ts'
import { clearPositions, locate, select, treeJson } from './ast/tree.ts'
import groups from './Section/groups.ts'
import createSection from './Section/index.ts'
import type {
  Heading, Paragraph, Link, Embed, Image, ImageReference, Task, List, Callout,
  Highlight, Comment, Code, Math as MathSection, InlineMath, Table, Frontmatter,
  Tag, FootnoteDefinition, InlineFootnote
} from './Section/types.ts'

// Owns document state; parsing and serialization are stateless operations.
class Page {
  #tree: PageNode
  #source: string | undefined
  #options: ParseOptions
  #dirty = false

  constructor(tree: PageNode, source?: string, options: ParseOptions = {}) {
    if (tree?.type !== 'root' || !Array.isArray(tree.children)) {
      throw new TypeError('Expected a parsed document root')
    }
    // Each page owns its edits, even when created from the same document.
    this.#tree = structuredClone(tree)
    this.#source = source
    // Retain settings so inserted fragments and later serialization stay consistent.
    this.#options = {
      ...options,
      gfm: { ...options.gfm },
      math: { ...options.math },
      markdown: { ...options.markdown }
    }
  }

  #changed() {
    this.#dirty = true
    clearPositions(this.#tree)
  }

  // Handles reference live nodes; output methods return detached views.
  #select(predicate: Predicate) {
    return select(this.#tree, predicate).map((node) =>
      createSection(node, {
        locate: (target) => locate(this.#tree, target),
        changed: () => this.#changed(),
        page: this
      })
    )
  }

  ast(options: AstOptions = {}): PageNode {
    return outputTree(this.#tree, { ...astDefaults, ...options }) as PageNode
  }
  json(options: JsonOptions = {}): PageJSON {
    options = { ...jsonDefaults, ...options }
    return treeJson(outputTree(this.#tree, options) as PageNode, options, this)
  }
  text(options: TextOptions = {}) {
    return text(this.#tree, options)
  }
  html(options: HtmlOptions = {}) {
    return html(this.#tree, options)
  }
  markdown(options: MarkdownOptions = {}) {
    // Reuse exact source only when neither edits nor exclusions affect the output.
    options = { ...markdownDefaults, ...options }
    const filtered = Object.values(options).some((value) => value !== true)
    if (!filtered && !this.#dirty && typeof this.#source === 'string') {
      return this.#source
    }
    return stringifyMd(markdownTree(this.#tree, options) as PageNode, this.#options)
  }

  // Parse before insertion so malformed input cannot partially change the tree.
  append(markdown: string) {
    this.#tree.children.push(...parseMd(markdown, this.#options).tree.children)
    this.#changed()
    return this
  }

  prepend(markdown: string) {
    this.#tree.children.unshift(...parseMd(markdown, this.#options).tree.children)
    this.#changed()
    return this
  }

  // Selection methods share the same predicates as JSON output and filtering.
  headings() {
    return this.#select(groups.headings) as Heading[]
  }
  paragraphs() {
    return this.#select(groups.paragraphs) as Paragraph[]
  }
  links() {
    return this.#select(groups.links) as Link[]
  }
  embeds() {
    return this.#select(groups.embeds) as (Embed | Image | ImageReference)[]
  }
  tasks() {
    return this.#select(groups.tasks) as Task[]
  }
  lists() {
    return this.#select(groups.lists) as List[]
  }
  callouts() {
    return this.#select(groups.callouts) as Callout[]
  }
  highlights() {
    return this.#select(groups.highlights) as Highlight[]
  }
  comments() {
    return this.#select(groups.comments) as Comment[]
  }
  code() {
    return this.#select(groups.code) as Code[]
  }
  math() {
    return this.#select(groups.math) as (MathSection | InlineMath)[]
  }
  tables() {
    return this.#select(groups.tables) as Table[]
  }
  frontmatter() {
    return this.#select(groups.frontmatter) as Frontmatter[]
  }
  tags() {
    return this.#select(groups.tags) as Tag[]
  }
  footnotes() {
    return this.#select(groups.footnotes) as (FootnoteDefinition | InlineFootnote)[]
  }
}

const makePage = (tree: PageNode, source?: string, options?: ParseOptions) =>
  new Page(tree, source, options)

export { makePage }
export default Page

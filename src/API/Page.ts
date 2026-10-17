import type { ParseOptions, PageJSON } from '../types/api.ts'
import type { TextOptions, JsonOptions, MarkdownOptions, AstOptions, HtmlOptions } from '../types/options.ts'
import type { PageNode, Predicate } from '../types/ast.ts'
import parseMd from '../parse/index.ts'
import stringifyMd from '../parse/stringify.ts'
import outputTree from './out/ast/output.ts'
import text from './out/text/text.ts'
import html from './out/html/html.ts'
import astDefaults from './out/ast/defaults.ts'
import jsonDefaults from './out/json/defaults.ts'
import markdownDefaults from './out/markdown/defaults.ts'
import markdownTree from './out/markdown/markdown.ts'
import { clearPositions, locate, select, treeJson } from './ast/tree.ts'
import groups from './Section/groups.ts'
import createSection from './Section/index.ts'
import type Link from './Section/Link.ts'
import type Embed from './Section/Embed.ts'
import type Callout from './Section/Callout.ts'

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
    return this.#select(groups.headings)
  }
  paragraphs() {
    return this.#select(groups.paragraphs)
  }
  links() {
    return this.#select(groups.links) as Link[]
  }
  embeds() {
    return this.#select(groups.embeds) as Embed[]
  }
  tasks() {
    return this.#select(groups.tasks)
  }
  lists() {
    return this.#select(groups.lists)
  }
  callouts() {
    return this.#select(groups.callouts) as Callout[]
  }
  highlights() {
    return this.#select(groups.highlights)
  }
  comments() {
    return this.#select(groups.comments)
  }
  code() {
    return this.#select(groups.code)
  }
  math() {
    return this.#select(groups.math)
  }
  tables() {
    return this.#select(groups.tables)
  }
  frontmatter() {
    return this.#select(groups.frontmatter)
  }
  tags() {
    return this.#select(groups.tags)
  }
  footnotes() {
    return this.#select(groups.footnotes)
  }
}

const makePage = (tree: PageNode, source?: string, options?: ParseOptions) =>
  new Page(tree, source, options)

export { makePage }
export default Page

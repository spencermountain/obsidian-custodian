import parseMd from '../parse/index.js'
import stringifyMd from '../parse/stringify.js'
import outputTree from './_lib/output.js'
import text from './text.js'
import { clearPositions, locate, select, treeJson } from './_lib/tree.js'
import { groups } from './json.js'
import createHandle from './handle.js'

// Owns document state; parsing and serialization are stateless operations.
class Page {
  #tree
  #source
  #options
  #dirty = false

  constructor(tree, source, options = {}) {
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
  #select(predicate) {
    return select(this.#tree, predicate).map((node) =>
      createHandle(node, {
        locate: (target) => locate(this.#tree, target),
        changed: () => this.#changed(),
        page: this
      })
    )
  }

  ast(options = {}) {
    return outputTree(this.#tree, options)
  }

  text(options = {}) {
    return text(outputTree(this.#tree, options), options)
  }

  markdown(options = {}) {
    // Reuse exact source only when neither edits nor exclusions affect the output.
    const filtered = Object.values(options).includes(false)
    if (!filtered && !this.#dirty && typeof this.#source === 'string') {
      return this.#source
    }
    return stringifyMd(outputTree(this.#tree, options), this.#options)
  }

  // Include nested addressable blocks as well as the document's top-level blocks.
  blocks() {
    return this.#select((node, parent) => parent === this.#tree || Boolean(node.blockId))
  }

  json(options = {}) {
    return treeJson(outputTree(this.#tree, options), options)
  }

  // Parse before insertion so malformed input cannot partially change the tree.
  append(markdown) {
    this.#tree.children.push(...parseMd(markdown, this.#options).tree.children)
    this.#changed()
    return this
  }

  prepend(markdown) {
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
    return this.#select(groups.links)
  }
  embeds() {
    return this.#select(groups.embeds)
  }
  tasks() {
    return this.#select(groups.tasks)
  }
  lists() {
    return this.#select(groups.lists)
  }
  callouts() {
    return this.#select(groups.callouts)
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
  footnotes() {
    return this.#select(groups.footnotes)
  }
}

const makePage = (tree, source, options) => new Page(tree, source, options)

export { makePage }
export default Page

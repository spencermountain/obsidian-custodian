import parseMd from '../parse/index.js'
import stringifyMd from '../parse/stringify.js'
import { walk, plainText } from '../parse/syntax/_lib.js'
import { groups } from './json.js'
import createHandle from './_lib.js'

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
    this.#options = {
      ...options,
      gfm: { ...options.gfm },
      math: { ...options.math },
      markdown: { ...options.markdown }
    }
  }

  #changed() {
    this.#dirty = true
    // Source positions no longer describe the serialized document after editing.
    walk(this.#tree, (node) => {
      delete node.position
    })
  }

  #locate(target) {
    let found = null
    walk(this.#tree, (node, parent) => {
      if (node === target) {
        found = parent
      }
    })
    if (!found) {
      throw new Error('This item has been removed or detached')
    }
    return found
  }

  #select(predicate) {
    const nodes = []
    walk(this.#tree, (node, parent) => {
      if (predicate(node, parent)) {
        nodes.push(
          createHandle(node, {
            locate: (target) => this.#locate(target),
            changed: () => this.#changed(),
            page: this
          })
        )
      }
    })
    return nodes
  }

  ast() {
    return structuredClone(this.#tree)
  }

  markdown() {
    if (!this.#dirty && typeof this.#source === 'string') {
      return this.#source
    }
    return stringifyMd(this.#tree, this.#options)
  }

  blocks() {
    return this.#select((node, parent) => parent === this.#tree || Boolean(node.blockId))
  }

  json() {
    const result = { text: plainText(this.#tree), blocks: this.blocks().map((item) => item.json()) }
    Object.keys(groups).forEach((key) => {
      result[key] = this[key]().map((item) => item.json())
    })
    return result
  }

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

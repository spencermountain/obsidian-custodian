import type { Processor, Transformer } from 'unified'
import type { Root } from 'mdast'
import type { ParseOptions, DocumentNode } from '../types.js'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import syntax from './syntax/tokenize.js'
import fromMarkdown from './syntax/from-markdown.js'
import toMarkdown from './syntax/to-markdown.js'
import transform from './syntax/transform.js'

// Unified supplies `this`; arrow functions cannot be used for plugin attachers.
const obsidianSyntax = function (this: Processor) {
  // External remark users may call runSync(parse(input)) without passing a file.
  // Keep the source for that tree so escaped markers and HTML remain literal.
  const sources = new WeakMap<object, string>()
  const parser = this.parser
  if (parser) {
    this.parser = (input, file) => {
      const tree = parser(input, file)
      sources.set(tree, input)
      return tree
    }
  }

  // Extend the host pipeline instead of replacing its existing syntax handlers.
  const data = this.data()
  data.micromarkExtensions ??= []
  data.fromMarkdownExtensions ??= []
  data.toMarkdownExtensions ??= []
  data.micromarkExtensions.push(syntax())
  data.fromMarkdownExtensions.push(fromMarkdown())
  data.toMarkdownExtensions.push(toMarkdown())

  const transformer: Transformer<Root, Root> = (tree, file) => {
    let source = sources.get(tree)
    if (source === undefined && file.value !== undefined) {
      source = String(file.value)
    }
    transform(tree as unknown as DocumentNode, (input) => this.parse(input) as unknown as DocumentNode, source)
  }
  return transformer
}

const remarkObsidian = function (this: Processor, options: ParseOptions = {}) {
  // Obsidian strikethrough uses double tildes unless the caller overrides GFM.
  this.use(remarkGfm, { singleTilde: false, ...options.gfm })
  this.use(remarkMath, options.math)
  // Recognize YAML boundaries but leave property values as raw text.
  this.use(remarkFrontmatter, ['yaml'])
  // Register last so our task-list serializer takes precedence over GFM's.
  this.use(obsidianSyntax)
}

export default remarkObsidian

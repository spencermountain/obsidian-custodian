import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import syntax from './syntax/tokenize.js'
import fromMarkdown from './syntax/from-markdown.js'
import toMarkdown from './syntax/to-markdown.js'
import transform from './syntax/transform.js'

// Unified supplies `this`; arrow functions cannot be used for plugin attachers.
const obsidianSyntax = function () {
  // External remark users may call runSync(parse(input)) without passing a file.
  // Keep the source for that tree so escaped markers and HTML remain literal.
  const sources = new WeakMap()
  const parser = this.parser
  if (parser) {
    this.parser = (input, file) => {
      const tree = parser(input, file)
      sources.set(tree, input)
      return tree
    }
  }

  const data = this.data()
  data.micromarkExtensions ??= []
  data.fromMarkdownExtensions ??= []
  data.toMarkdownExtensions ??= []
  data.micromarkExtensions.push(syntax())
  data.fromMarkdownExtensions.push(fromMarkdown())
  data.toMarkdownExtensions.push(toMarkdown())

  return (tree, file) => {
    let source = sources.get(tree)
    if (source === undefined && file.value !== undefined) {
      source = String(file.value)
    }
    return transform(tree, (input) => this.parse(input), source)
  }
}

const remarkObsidian = function (options = {}) {
  this.use(remarkGfm, { singleTilde: false, ...options.gfm })
  this.use(remarkMath, options.math)
  this.use(remarkFrontmatter, ['yaml'])
  // Register last so our task-list serializer takes precedence over GFM's.
  this.use(obsidianSyntax)
}

export default remarkObsidian

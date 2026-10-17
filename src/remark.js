import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import { defaultHandlers } from 'mdast-util-to-markdown'
import syntax from './syntax/tokenize.js'
import fromMarkdown from './syntax/from-markdown.js'
import toMarkdown from './syntax/to-markdown.js'
import transform from './syntax/transform.js'

// Unified binds the processor to plugin functions.
const obsidianSyntax = function () {
  const sources = new WeakMap()
  const parser = this.parser
  if (parser) {
    this.parser = (source, file) => {
      const tree = parser(source, file)
      sources.set(tree, source)
      return tree
    }
  }
  const data = this.data()
  const add = (key, extension) => {
    if (!data[key]) { data[key] = [] }
    data[key].push(extension)
  }
  add('micromarkExtensions', syntax())
  add('fromMarkdownExtensions', fromMarkdown())
  const extension = toMarkdown()
  extension.handlers.blockId = (node) => ` ^${node.value}`
  extension.handlers.callout = (node, parent, state, info) => {
    let fold = ''
    if (node.fold) { fold = node.fold === 'collapsed' ? '-' : '+' }
    const title = state.containerPhrasing({ type: 'paragraph', children: node.title }, { ...info, before: ' ', after: '\n' })
    const body = state.containerFlow({ type: 'blockquote', children: node.children }, info)
    const header = `[!${node.calloutType}]${fold}${title ? ` ${title}` : ''}`
    return `${header}${body ? `\n${body}` : ''}`.split('\n').map((line) => `>${line ? ` ${line}` : ''}`).join('\n')
  }
  extension.handlers.listItem = (node, parent, state, info) => {
    const result = defaultHandlers.listItem(node, parent, state, info)
    if (typeof node.checked !== 'boolean') { return result }
    let marker = ' '
    if (node.checked) { marker = node.taskMarker || 'x' }
    return result.replace(/^([*+-]|\d+[.)])(?: |$)/, `$1 [${marker}] `)
  }
  add('toMarkdownExtensions', extension)
  return (tree, file) => transform(tree, this, sources.get(tree) ?? (file.value === undefined ? undefined : String(file.value)))
}

const remarkObsidian = function (options = {}) {
  this.use(remarkGfm, { singleTilde: false, ...options.gfm })
  this.use(remarkMath, options.math)
  this.use(remarkFrontmatter, ['yaml'])
  this.use(obsidianSyntax)
}

export default remarkObsidian

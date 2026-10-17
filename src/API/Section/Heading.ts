import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions, MarkdownOptions } from '../../types/options.ts'
import { walk, plainText } from '../../parse/syntax/_lib.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import markdownDefaults from '../out/markdown.ts'
import renderText from './_lib/text.ts'
import metadata from './_lib/metadata.ts'
import { element } from './_lib/html/elements.ts'

class Heading extends Section {
  markdownNode(options: MarkdownOptions = {}) {
    options = { ...markdownDefaults, ...options }
    const node = super.markdownNode(options)
    if (node && options.headings === 'inline') {
      node.type = 'paragraph'
      delete node.depth
    }
    return node
  }

  json(options: JsonOptions = {}) {
    return metadata(super.json(options), this.node, ['depth'])
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    const content = (node.children || []).map(child => renderText(child, options)).join('')
    return options.headings === true ? '#'.repeat(node.depth) + ' ' + content : content
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    const node = this.node
    const content = state.all(node)
    if (options.headings === 'inline') { return content }
    const depth = Number.isInteger(node.depth) && node.depth >= 1 && node.depth <= 6 ? node.depth : 1
    // Only add heading anchors when this document links to them.
    if (!state.headingTargets) {
      state.headingTargets = new Set()
      walk(state.root, child => {
        if (child.type === 'wikiLink' && !child.target && child.heading) {
          state.headingTargets.add(child.heading)
        }
      })
    }
    const label = plainText(node)
    const id = state.headingTargets.has(label) ? label : node.data?.hProperties?.id
    return element('h' + depth, { id: id == null ? undefined : 'user-content-' + id }, content)
  }
}

export default Heading

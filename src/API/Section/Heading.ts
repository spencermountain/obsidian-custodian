import Section from './Section.ts'
import type { TextOptions, HtmlOptions, MarkdownOptions } from '../../types/options.ts'
import { walk, plainText } from '../../parse/syntax/_lib.ts'
import textDefaults from '../out/text.ts'
import markdownDefaults from '../out/markdown.ts'
import metadata from './_lib/metadata.ts'
import { element } from './_lib/html/elements.ts'

class Heading extends Section {
  markdownNode(setting: MarkdownOptions['headings'] = markdownDefaults.headings) {
    const node = super.markdownNode(setting)
    if (node && setting === 'inline') {
      node.type = 'paragraph'
      delete node.depth
    }
    return node
  }

  json(setting?: boolean) {
    return metadata(super.json(setting), this.node, ['depth'])
  }

  text(setting?: TextOptions['headings']): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    const content = (node.children || []).map(child => this.renderText(child)).join('')
    return (setting ?? textDefaults.headings) === true ? '#'.repeat(node.depth) + ' ' + content : content
  }

  html(setting?: HtmlOptions['headings']): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    const content = state.all(node)
    if (setting === 'inline') { return content }
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

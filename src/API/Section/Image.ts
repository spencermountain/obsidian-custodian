import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import metadata from './_lib/metadata.ts'
import { element, url } from './_lib/html/elements.ts'
import { dimensions } from '../../parse/syntax/_lib.ts'

class Image extends Section {
  json(options: JsonOptions = {}) {
    const result = metadata(super.json(options), this.node, ['url', 'alt', 'title'])
    if (!result) { return null }
    Object.assign(result, dimensions((this.node.alt || '').split('|').at(-1)))
    return result
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    return node.alt || ''
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    const node = this.node
    const parts = (node.alt || '').split('|')
    const size = dimensions(parts.at(-1))
    let alt = node.alt || ''
    if (parts.length > 1 && Object.keys(size).length) {
      alt = parts.slice(0, -1).join('|')
    }
    return element('img', { src: url(node.url, true), alt, title: node.title, ...size })
  }
}

export default Image

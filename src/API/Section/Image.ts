import Section from './Section.ts'
import metadata from './_lib/metadata.ts'
import { element, url } from './_lib/html/elements.ts'
import { dimensions } from '../../parse/syntax/_lib.ts'

class Image extends Section {
  json(setting?: boolean) {
    const result = metadata(super.json(setting), this.node, ['url', 'alt', 'title'])
    if (!result) { return null }
    Object.assign(result, dimensions((this.node.alt || '').split('|').at(-1)))
    return result
  }

  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return node.alt || ''
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
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

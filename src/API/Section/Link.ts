import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import renderText from './_lib/text.ts'
import metadata from './_lib/metadata.ts'
import { element, url } from './_lib/html/elements.ts'

class Link extends Section {
  get title(): string { return this.text() }
  set title(value: string) {
    this.update({ text: value })
  }
  get target(): string {
    const node = this.json()
    return node.url ?? ''
  }
  set target(value: string) {
    this.update({ url: value })
  }

  json(options: JsonOptions = {}) {
    return metadata(super.json(options), this.node, ['url', 'title'])
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    return (node.children || []).map(child => renderText(child, options)).join('')
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    const node = this.node
    return element('a', { href: url(node.url), title: node.title }, state.all(node))
  }
}

export default Link

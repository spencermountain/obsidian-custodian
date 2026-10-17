import Section from '../Section.ts'
import type { TextOptions } from '../../../types/options.ts'
import metadata from '../_lib/metadata.ts'
import { element, url } from '../_lib/html/elements.ts'

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

  json(setting?: boolean) {
    return metadata(super.json(setting), this.node, ['url', 'title'])
  }

  text(setting?: TextOptions['links']): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return (node.children || []).map(child => this.renderText(child)).join('')
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    return element('a', { href: url(node.url), title: node.title }, state.all(node))
  }
}

export default Link

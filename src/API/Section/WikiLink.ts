import Link from './Link.ts'
import type { TextOptions } from '../../types/options.ts'
import metadata from './_lib/metadata.ts'
import { element, text as escape, url } from './_lib/html/elements.ts'
import destination from './_lib/destination.ts'

class WikiLink extends Link {
  get title(): string { return this.text() }
  set title(value: string) { this.update({ alias: value }) }
  get target(): string { return this.node.target ?? '' }
  set target(value: string) { this.update({ target: value }) }

  json(setting?: boolean) {
    return metadata(super.json(setting), this.node, ['target', 'alias', 'heading', 'block'])
  }

  text(setting?: TextOptions['links']): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    if (node.alias != null) { return node.alias }
    const fragment = node.heading ?? (node.block ? '^' + node.block : '')
    return node.target + (node.target && fragment ? '#' : '') + fragment
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    const target = destination(node)
    let href = encodeURI(target)
    if (!node.target && node.block) {
      href = '#block-' + encodeURIComponent(node.block)
    }
    return element('a', { href: url(href), className: 'internal-link', dataHref: target }, escape(node.alias ?? target))
  }
}

export default WikiLink

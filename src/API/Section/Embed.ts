import Section from './Section.ts'
import metadata from './_lib/metadata.ts'
import { element, text as escape, url } from './_lib/html/elements.ts'
import { dimensions } from '../../parse/syntax/_lib.ts'
import destination from './_lib/destination.ts'

class Embed extends Section {
  json(setting?: boolean) {
    const result = metadata(super.json(setting), this.node, ['target', 'alias', 'heading', 'block'])
    if (!result) { return null }
    Object.assign(result, dimensions(this.node.alias ?? ''))
    if (/\.pdf$/i.test(this.node.target)) {
      const params = new URLSearchParams(this.node.heading || '')
      const fields = ['page', 'height']
      fields.forEach(key => {
        const value = params.get(key)
        if (value && /^[1-9]\d*$/.test(value)) { result[key] = Number(value) }
      })
    }
    return result
  }

  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return node.alias ?? node.target
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    if (/\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(node.target)) {
      const size = dimensions(node.alias ?? '')
      return element('img', {
        src: url(encodeURI(destination(node)), true),
        alt: Object.keys(size).length ? node.target : node.alias ?? node.target,
        ...size
      })
    }
    const target = destination(node)
    let href = encodeURI(target)
    if (!node.target && node.block) { href = '#block-' + encodeURIComponent(node.block) }
    return element('a', { href: url(href), className: 'internal-embed', dataHref: target }, escape(node.alias ?? target))
  }
}

export default Embed

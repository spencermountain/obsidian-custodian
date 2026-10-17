import type { OutputOptions } from '../../types/types.ts'
import Section from './Section.ts'

class Link extends Section {
  get title(): string {
    return this.text()
  }
  set title(value: string) {
    if (this.ast().type === 'wikiLink') {
      this.update({ alias: value })
    } else {
      this.update({ text: value })
    }
  }

  get target(): string {
    const node = this.json()
    return node.target ?? node.url ?? ''
  }
  set target(value: string) {
    const node = this.ast()
    if (node.type === 'wikiLink') {
      this.update({ target: value })
    } else if (node.type === 'linkReference') {
      this.update({ url: value, title: this.json().title ?? null })
    } else {
      this.update({ url: value })
    }
  }

  text(options: OutputOptions = {}): string {
    const node = this.ast(options)
    if (!node) {
      return ''
    }
    if (node.type !== 'wikiLink') {
      return super.text(options)
    }
    if (node.alias != null) {
      return node.alias
    }
    const fragment = node.heading ?? (node.block ? '^' + node.block : '')
    return node.target + (node.target && fragment ? '#' : '') + fragment
  }
}

export default Link

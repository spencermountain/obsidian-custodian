import renderText from '../out/text.ts'
import type {
  TextOptions,
  JsonOptions,
  MarkdownOptions,
  AstOptions,
  HtmlOptions
} from '../../types/options.ts'
import Section from './Section.ts'

class Callout extends Section {
  get title(): string {
    return this.json()?.title || ''
  }
  set title(value: string) {
    this.update({ title: value })
  }

  body(options: TextOptions = {}): string {
    return this.text({ ...options, calloutTitles: false })
  }

  text(options: TextOptions = {}): string {
    const node = this.ast(options)
    if (!node) {
      return ''
    }
    const children = [...node.children]
    if (options.calloutTitles !== false && node.title?.length) {
      children.unshift({ type: 'paragraph', children: node.title })
    }
    return children.map((child) => renderText(child, options)).join('\n')
  }

  json(options: JsonOptions = {}) {
    const result = super.json(options)
    if (!result) {
      return null
    }
    const node = this.ast(options)
    return {
      ...result,
      title: renderText({ type: 'paragraph', children: node.title }, options)
    }
  }
}

export default Callout

import renderText from '../text.ts'
import type { OutputOptions } from '../../types/types.ts'
import Section from './Section.ts'

class Callout extends Section {
  title(options: OutputOptions = {}): string {
    return this.json(options)?.title || ''
  }

  body(options: OutputOptions = {}): string {
    return this.text({ ...options, calloutTitles: false })
  }

  text(options: OutputOptions = {}): string {
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

  json(options: OutputOptions = {}) {
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

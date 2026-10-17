import renderText, { jsonText } from '../out/text/text.ts'
import type { TextOptions, JsonOptions } from '../../types/options.ts'
import Section from './Section.ts'
import outputTree from '../out/ast/output.ts'
import textDefaults from '../out/text/defaults.ts'
import jsonDefaults from '../out/json/defaults.ts'

class Callout extends Section {
  get title(): string {
    return this.json()?.title || ''
  }
  set title(value: string) {
    this.update({ title: value })
  }

  body(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    return this.text({ ...options, callouts: options.callouts === false ? false : 'body' })
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) {
      return ''
    }
    const children = [...node.children]
    if (options.callouts !== 'body' && node.title?.length) {
      children.unshift({ type: 'paragraph', children: node.title })
    }
    return children.map((child) => renderText(child, options)).join('\n')
  }

  json(options: JsonOptions = {}) {
    options = { ...jsonDefaults, ...options }
    const result = super.json(options)
    if (!result) {
      return null
    }
    const node = outputTree(this.node, options)
    return {
      ...result,
      title: jsonText({ type: 'paragraph', children: node.title }, options)
    }
  }
}

export default Callout

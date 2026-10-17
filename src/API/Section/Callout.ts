import Section from './Section.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import jsonDefaults from '../out/json.ts'
import renderText, { jsonText } from './_lib/text.ts'
import metadata from './_lib/metadata.ts'
import { element, text as escape } from './_lib/html/elements.ts'

class Callout extends Section {
  get title(): string { return this.json()?.title || '' }
  set title(value: string) { this.update({ title: value }) }
  body(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    return this.text({ ...options, callouts: options.callouts === false ? false : 'body' })
  }

  json(options: JsonOptions = {}) {
    const result = metadata(super.json(options), this.node, ['calloutType', 'fold'])
    if (!result) { return null }
    const node = outputTree(this.node, { ...jsonDefaults, ...options })
    result.title = jsonText({ type: 'paragraph', children: node.title }, options)
    return result
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    const children = [...node.children]
    if (options.callouts !== 'body' && node.title?.length) {
      children.unshift({ type: 'paragraph', children: node.title })
    }
    return children.map(child => renderText(child, options)).join('\n')
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    const node = this.node
    const title = state.all({ type: 'paragraph', children: node.title || [] })
    const body = element('div', { className: ['callout-content'] }, state.all(node))
    const properties = { className: ['callout'], dataCallout: node.calloutType }
    if (node.fold) {
      return element('details', { ...properties, open: node.fold === 'expanded' }, [
        element('summary', { className: ['callout-title'] }, title.length ? title : [escape(node.calloutType)]),
        body
      ])
    }
    const children = [body]
    if (title.length) {
      children.unshift(element('div', { className: ['callout-title'] }, title))
    }
    return element('div', properties, children)
  }
}

export default Callout

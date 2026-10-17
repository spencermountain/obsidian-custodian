import Section from './Section.ts'
import type { TextOptions, HtmlOptions } from '../../types/options.ts'
import metadata from './_lib/metadata.ts'
import { element, text as escape } from './_lib/html/elements.ts'

class Callout extends Section {
  get title(): string { return this.json()?.title || '' }
  set title(value: string) { this.update({ title: value }) }
  body(include = true): string {
    return this.text(include === false ? false : 'body')
  }

  json(setting?: boolean) {
    const result = metadata(super.json(setting), this.node, ['calloutType', 'fold'])
    if (!result) { return null }
    const node = this.jsonNode(setting)
    result.title = this.jsonText({ type: 'paragraph', children: node.title })
    return result
  }

  text(setting?: TextOptions['callouts']): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    const children = [...node.children]
    if (setting !== 'body' && node.title?.length) {
      children.unshift({ type: 'paragraph', children: node.title })
    }
    return children.map(child => this.renderText(child)).join('\n')
  }

  html(setting?: HtmlOptions['callouts']): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
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

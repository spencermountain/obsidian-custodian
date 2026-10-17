import Link from './Link.ts'
import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import jsonDefaults from '../out/json.ts'
import renderText from './_lib/text.ts'
import metadata from './_lib/metadata.ts'
import { url } from './_lib/html/elements.ts'
import { definitions, normalize } from '../ast/references.ts'

class LinkReference extends Link {
  get target(): string { return this.json()?.url ?? '' }
  set target(value: string) {
    this.update({ url: value, title: this.json()?.title ?? null })
  }

  json(options: JsonOptions = {}) {
    if (this.node.type !== 'linkReference') { return super.json(options) }
    const result = metadata(super.json(options), this.node, ['identifier', 'label'])
    if (!result) { return null }
    const page = this.context.page
    const definition = page && definitions(page.ast({ ...jsonDefaults, ...options })).get(normalize(this.node.identifier))
    if (definition) {
      result.url = definition.url
      if (definition.title != null) { result.title = definition.title }
    }
    return result
  }

  text(options: TextOptions = {}): string {
    options = { ...textDefaults, ...options }
    const node = outputTree(this.node, options)
    if (!node) { return '' }
    return (node.children || []).map(child => renderText(child, options)).join('')
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    if (this.node.type !== 'linkReference') { return super.html(options, state, parent) }
    const node = this.node
    const definition = state.definitions.get(normalize(node.identifier))
    if (!definition) { return state.all(node) }
    const resolved = { ...node, url: definition.url, title: definition.title }
    return new Link(resolved).html(options, state)
  }
}

export default LinkReference

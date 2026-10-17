import Link from './Link.ts'
import type { TextOptions } from '../../types/options.ts'
import metadata from './_lib/metadata.ts'
import { url } from './_lib/html/elements.ts'
import { normalize } from '../ast/references.ts'

class LinkReference extends Link {
  get target(): string { return this.json()?.url ?? '' }
  set target(value: string) {
    this.update({ url: value, title: this.json()?.title ?? null })
  }

  json(setting?: boolean) {
    if (this.node.type !== 'linkReference') { return super.json(setting) }
    const result = metadata(super.json(setting), this.node, ['identifier', 'label'])
    if (!result) { return null }
    const definition = this.definition()
    if (definition) {
      result.url = definition.url
      if (definition.title != null) { result.title = definition.title }
    }
    return result
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
    if (this.node.type !== 'linkReference') { return super.html(setting) }
    const node = this.node
    const definition = state.definitions.get(normalize(node.identifier))
    if (!definition) { return state.all(node) }
    const resolved = { ...node, url: definition.url, title: definition.title }
    return new Link(resolved, this.context).html(setting)
  }
}

export default LinkReference

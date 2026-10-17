import type { TextOptions, JsonOptions, HtmlOptions } from '../../types/options.ts'
import outputTree from '../ast/output.ts'
import textDefaults from '../out/text.ts'
import jsonDefaults from '../out/json.ts'
import metadata from './_lib/metadata.ts'
import { text as escape, url } from './_lib/html/elements.ts'
import { definitions, normalize } from '../ast/references.ts'
import Image from './Image.ts'

class ImageReference extends Image {
  json(options: JsonOptions = {}) {
    const result = metadata(super.json(options), this.node, ['identifier', 'label', 'alt'])
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
    return node.alt || ''
  }

  html(options: HtmlOptions = {}, state?: any, parent?: any): string {
    if (!state) { return super.html(options) }
    const node = this.node
    const definition = state.definitions.get(normalize(node.identifier))
    if (!definition) { return escape(node.alt || '') }
    const resolved = { ...node, url: definition.url, title: definition.title }
    return new Image(resolved).html(options, state)
  }
}

export default ImageReference

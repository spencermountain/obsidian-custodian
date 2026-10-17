import metadata from './_lib/metadata.ts'
import { text as escape, url } from './_lib/html/elements.ts'
import { normalize } from '../ast/references.ts'
import Image from './Image.ts'

class ImageReference extends Image {
  json(setting?: boolean) {
    const result = metadata(super.json(setting), this.node, ['identifier', 'label', 'alt'])
    if (!result) { return null }
    const definition = this.definition()
    if (definition) {
      result.url = definition.url
      if (definition.title != null) { result.title = definition.title }
    }
    return result
  }

  text(setting?: boolean): string {
    if (setting === false) { return '' }
    const node = this.textNode(setting)
    if (!node) { return '' }
    return node.alt || ''
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    const definition = state.definitions.get(normalize(node.identifier))
    if (!definition) { return escape(node.alt || '') }
    const resolved = { ...node, url: definition.url, title: definition.title }
    return new Image(resolved, this.context).html(setting)
  }
}

export default ImageReference

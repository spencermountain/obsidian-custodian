import Format from './Format.ts'
import metadata from '../_lib/metadata.ts'
import { element } from '../_lib/html/elements.ts'

class Highlight extends Format {
  json(setting?: boolean) {
    return metadata(super.json(setting), this.node, ['color'])
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    return element('mark', { dataColor: node.color }, state.all(node))
  }
}

export default Highlight

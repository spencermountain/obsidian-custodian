import Format from './Format.ts'
import { element } from '../_lib/html/elements.ts'

class Strong extends Format {
  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    return element('strong', {}, state.all(node))
  }
}

export default Strong

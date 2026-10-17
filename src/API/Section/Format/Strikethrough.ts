import Format from './Format.ts'
import { element } from '../_lib/html/elements.ts'

class Strikethrough extends Format {
  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    return element('del', {}, state.all(node))
  }
}

export default Strikethrough

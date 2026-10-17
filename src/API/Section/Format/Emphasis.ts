import Format from './Format.ts'
import { element } from '../_lib/html/elements.ts'

class Emphasis extends Format {
  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const node = this.node
    return element('em', {}, state.all(node))
  }
}

export default Emphasis

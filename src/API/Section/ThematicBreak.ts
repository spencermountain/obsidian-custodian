import Section from './Section.ts'
import { element } from './_lib/html/elements.ts'

class ThematicBreak extends Section {
  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    return element('hr')
  }
}

export default ThematicBreak

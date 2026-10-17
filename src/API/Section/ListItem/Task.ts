import ListItem from './ListItem.ts'
import metadata from '../_lib/metadata.ts'
import listItem from './_lib.ts'
import { element } from '../_lib/html/elements.ts'

// Tasks share list-item structure while owning checkbox state and presentation.
class Task extends ListItem {
  get checked(): boolean { return this.node.checked }
  set checked(value: boolean) { this.update({ checked: value }) }

  json(setting?: boolean) {
    return metadata(super.json(setting), this.node, ['checked', 'taskMarker'])
  }

  html(setting?: boolean): string {
    const state = this.context.html
    if (!state) { return super.html(setting) }
    const checkbox = element('input', { type: 'checkbox', disabled: true, checked: this.checked }) + ' '
    const content = listItem(this.node, state, this.context.parent, checkbox)
    return element('li', { className: 'task-list-item' }, content)
  }
}

export default Task

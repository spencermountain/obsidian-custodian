// Tight lists omit paragraph wrappers; loose lists retain their block structure.
import { element } from '../_lib/html/elements.ts'

const listItem = (node, state, parent, prefix = ''): string => {
  const loose = parent?.spread || parent?.children?.some(child => child.spread)
  return (node.children || []).map((child, index) => {
    const before = index === 0 ? prefix : ''
    if (child.type === 'paragraph') {
      const content = before + state.all(child)
      return loose ? element('p', {}, content) : content
    }
    return before + state.render(child, node)
  }).join('\n')
}

export default listItem

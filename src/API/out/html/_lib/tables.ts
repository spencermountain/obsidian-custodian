import { element } from './elements.ts'

const table = (state, node) => {
  const rows = (node.children || []).map((row, index) => {
    const cells = row.children.map((cell, column) => {
      const align = node.align?.[column]
      const properties = ['left', 'center', 'right'].includes(align) ? { align } : {}
      return element(index === 0 ? 'th' : 'td', properties, state.all(cell))
    })
    return element('tr', {}, cells)
  })
  const header = rows.length ? element('thead', {}, rows[0]) : ''
  const body = rows.length > 1 ? element('tbody', {}, rows.slice(1)) : ''
  return element('table', {}, header + body)
}

const list = (state, node) => {
  const tasks = node.children.some(child => typeof child.checked === 'boolean')
  const properties: Record<string, any> = {}
  if (tasks) {
    properties.className = 'contains-task-list'
  }
  if (node.ordered && node.start !== 1 && node.start != null) {
    properties.start = node.start
  }
  return element(node.ordered ? 'ol' : 'ul', properties, state.all(node))
}

const listItem = (state, node, parent) => {
  const properties: Record<string, any> = {}
  let checkbox = ''
  if (typeof node.checked === 'boolean') {
    properties.className = 'task-list-item'
    checkbox = element('input', { type: 'checkbox', disabled: true, checked: node.checked }) + ' '
  }
  // Tight lists omit paragraph wrappers; loose lists retain their block structure.
  const loose = parent?.spread || parent?.children?.some(child => child.spread)
  const children = (node.children || []).map((child, index) => {
    const prefix = index === 0 ? checkbox : ''
    if (child.type === 'paragraph') {
      const content = prefix + state.all(child)
      return loose ? element('p', {}, content) : content
    }
    return prefix + state.render(child, node)
  })
  return element('li', properties, children.join('\n'))
}

export { table, list, listItem }

import { element, text } from './elements.ts'

const callout = (state, node) => {
  const title = state.all({ type: 'paragraph', children: node.title || [] })
  const body = element('div', { className: ['callout-content'] }, state.all(node))
  const properties = { className: ['callout'], dataCallout: node.calloutType }
  if (node.fold) {
    return element('details', { ...properties, open: node.fold === 'expanded' }, [
      element('summary', { className: ['callout-title'] }, title.length ? title : [text(node.calloutType)]),
      body
    ])
  }
  const children = [body]
  if (title.length) {
    children.unshift(element('div', { className: ['callout-title'] }, title))
  }
  return element('div', properties, children)
}

export default callout

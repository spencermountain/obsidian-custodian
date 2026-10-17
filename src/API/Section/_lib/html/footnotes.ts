import { normalize } from '../../../ast/references.ts'
import { element } from './elements.ts'

// Number notes on first use, with a distinct backlink for each reference.
const footnotes = (definitions: Map<string, any>, render) => {
  const order: string[] = []
  const counts = new Map<string, number>()
  const id = (key: string) => encodeURIComponent(key.toLowerCase())
  const referenceId = (key: string, count: number) => {
    const suffix = count > 1 ? '-' + count : ''
    return 'user-content-fnref-' + id(key) + suffix
  }
  const reference = (node) => {
    const key = normalize(node.identifier)
    if (!definitions.has(key)) {
      return null
    }
    if (!counts.has(key)) {
      order.push(key)
    }
    const count = (counts.get(key) || 0) + 1
    counts.set(key, count)
    return {
      href: '#' + encodeURIComponent('user-content-fn-' + id(key)),
      id: referenceId(key, count),
      number: order.indexOf(key) + 1
    }
  }
  const footer = () => {
    if (!order.length) {
      return ''
    }
    const bodies: string[] = []
    // Notes can refer to additional notes; render each definition only once.
    for (let index = 0; index < order.length; index += 1) {
      bodies.push(render(definitions.get(order[index])))
    }
    const items = order.map((key, index) => {
      const backlinks = Array.from({ length: counts.get(key) }, (_, occurrence) => element('a', {
        href: '#' + encodeURIComponent(referenceId(key, occurrence + 1)),
        'data-footnote-backref': '',
        'aria-label': `Back to reference ${index + 1}`,
        className: 'data-footnote-backref'
      }, '↩')).join(' ')
      return element('li', { id: 'user-content-fn-' + id(key) }, bodies[index] + backlinks)
    })
    return element('section', { 'data-footnotes': '', className: 'footnotes' }, [
      element('h2', { id: 'user-content-footnote-label', className: 'sr-only' }, 'Footnotes'),
      element('ol', {}, items)
    ])
  }
  return { reference, footer }
}

export default footnotes

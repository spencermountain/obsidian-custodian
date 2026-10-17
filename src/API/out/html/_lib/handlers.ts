import { element, text } from './elements.ts'
import { wikiLink, embed, image, link, reference } from './links.ts'
import { table, list, listItem } from './tables.ts'
import callout from './callout.ts'

const literal = (node, language: string) => element('pre', {},
  element('code', { className: language ? 'language-' + language : undefined }, text(node.value)))

const handlers = {
  root: (state, node) => state.all(node, '\n'),
  text: (state, node) => text(node.value),
  // Raw markup is literal text, never interpreted as renderer-owned HTML.
  html: (state, node) => text(node.value),
  paragraph: (state, node) => element('p', {}, state.all(node)),
  heading: (state, node) => {
    const content = state.all(node)
    if (state.options.headings === 'inline') {
      return content
    }
    const depth = Number.isInteger(node.depth) && node.depth >= 1 && node.depth <= 6 ? node.depth : 1
    const id = node.data?.hProperties?.id
    return element('h' + depth, { id: id == null ? undefined : 'user-content-' + id }, content)
  },
  emphasis: (state, node) => element('em', {}, state.all(node)),
  strong: (state, node) => element('strong', {}, state.all(node)),
  delete: (state, node) => element('del', {}, state.all(node)),
  inlineCode: (state, node) => element('code', {}, text(node.value)),
  code: (state, node) => literal(node, (node.lang || '').split(/\s/)[0]),
  break: () => element('br') + '\n',
  thematicBreak: () => element('hr'),
  blockquote: (state, node) => element('blockquote', {}, state.all(node, '\n')),
  list,
  listItem,
  table,
  tableRow: (state, node) => element('tr', {}, state.all(node)),
  tableCell: (state, node) => element('td', {}, state.all(node)),
  link,
  image,
  linkReference: reference,
  imageReference: reference,
  wikiLink,
  embed,
  callout,
  definition: () => '',
  footnoteDefinition: () => '',
  footnoteReference: (state, node) => state.footnotes.reference(node),
  highlight: (state, node) => element('mark', { dataColor: node.color }, state.all(node)),
  tag: (state, node) => element('span', { className: 'tag' }, text('#' + node.value)),
  comment: (state, node) => element('span', { className: 'obsidian-comment' }, text(node.value)),
  blockId: (state, node) => element('span', { id: 'user-content-block-' + node.value }),
  yaml: (state, node) => literal(node, 'yaml'),
  math: (state, node) => element('pre', {}, element('code', {
    className: 'language-math math-display'
  }, text(node.value))),
  inlineMath: (state, node) => element('code', { className: 'language-math math-inline' }, text(node.value))
}

export default handlers

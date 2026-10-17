import { defaultHandlers } from 'mdast-util-to-markdown'
import { wikiMarkdown } from './_lib.js'

const wiki = (node, parent, state) => {
  const value = wikiMarkdown(node)
  // An alias separator must not become a new table cell.
  return state.stack.includes('tableCell') ? value.replace(/\|/g, '\\|') : value
}

const highlight = (node, parent, state, info) => {
  const content = state.containerPhrasing(node, { ...info, before: '=', after: '=' })
  return `==${content}==`
}

const callout = (node, parent, state, info) => {
  let fold = ''
  if (node.fold) {
    fold = node.fold === 'collapsed' ? '-' : '+'
  }
  const title = state.containerPhrasing(
    { type: 'paragraph', children: node.title },
    { ...info, before: ' ', after: '\n' }
  )
  const body = state.containerFlow({ type: 'blockquote', children: node.children }, info)
  let content = `[!${node.calloutType}]${fold}`
  if (title) { content += ` ${title}` }
  if (body) { content += `\n${body}` }
  return content.split('\n').map((line) => line ? `> ${line}` : '>').join('\n')
}

const listItem = (node, parent, state, info) => {
  const content = defaultHandlers.listItem(node, parent, state, info)
  if (typeof node.checked !== 'boolean') {
    return content
  }
  // Preserve Obsidian's custom checked markers, such as [?] and [-].
  const marker = node.checked ? node.taskMarker || 'x' : ' '
  return content.replace(/^([*+-]|\d+[.)])(?: |$)/, `$1 [${marker}] `)
}

const toMarkdown = () => ({
  // Escape literal text that would otherwise be interpreted as Obsidian syntax.
  unsafe: [
    { character: '[', after: '\\[' },
    { character: '=', after: '=' },
    { character: '%', after: '%' },
    { character: '^', before: '(?:^|\\s)', after: '[A-Za-z0-9-]+(?:$|\\n)' }
  ],
  handlers: {
    wikiLink: wiki,
    embed: wiki,
    comment: (node) => `%%${node.value}%%`,
    blockId: (node) => ` ^${node.value}`,
    highlight,
    callout,
    listItem
  }
})

export default toMarkdown

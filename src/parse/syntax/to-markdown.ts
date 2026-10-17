import type { Handle, Options } from 'mdast-util-to-markdown'
import type { Paragraph, Blockquote, ListItem } from 'mdast'
import type { MarkdownNode } from '../../types/types.ts'
import { defaultHandlers } from 'mdast-util-to-markdown'
import { wikiMarkdown } from './_lib.ts'

const wiki: Handle = (node, parent, state) => {
  const value = wikiMarkdown(node as unknown as MarkdownNode)
  // An alias separator must not become a new table cell.
  return state.stack.includes('tableCell') ? value.replace(/\|/g, '\\|') : value
}

const highlight: Handle = (node, parent, state, info) => {
  // Give remark the delimiter context so it can escape nested text correctly.
  const content = state.containerPhrasing(node as Paragraph, { ...info, before: '=', after: '=' })
  return `==${content}==`
}

const callout: Handle = (raw, parent, state, info) => {
  const node = raw as unknown as MarkdownNode
  let fold = ''
  if (node.fold) {
    fold = node.fold === 'collapsed' ? '-' : '+'
  }
  const title = state.containerPhrasing({ type: 'paragraph', children: node.title } as Paragraph, {
    ...info,
    before: ' ',
    after: '\n'
  })
  const body = state.containerFlow(
    { type: 'blockquote', children: node.children } as Blockquote,
    info
  )
  let content = `[!${node.calloutType}]${fold}`
  if (title) {
    content += ` ${title}`
  }
  if (body) {
    content += `\n${body}`
  }
  // Every line, including blanks and nested blocks, must remain inside the quote.
  return content
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n')
}

const listItem: Handle = (raw, parent, state, info) => {
  const node = raw as ListItem & { taskMarker?: string }
  const content = defaultHandlers.listItem(node, parent, state, info)
  if (typeof node.checked !== 'boolean') {
    return content
  }
  // Preserve Obsidian's custom checked markers, such as [?] and [-].
  const marker = node.checked ? node.taskMarker || 'x' : ' '
  return content.replace(/^([*+-]|\d+[.)])(?: |$)/, `$1 [${marker}] `)
}

const handlers: Record<string, Handle> = {
  wikiLink: wiki,
  embed: wiki,
  comment: (node) => `%%${(node as unknown as MarkdownNode).value}%%`,
  blockId: (node) => ` ^${(node as unknown as MarkdownNode).value}`,
  highlight,
  callout,
  listItem
}

const toMarkdown = (): Options => ({
  // Escape literal text that would otherwise be interpreted as Obsidian syntax.
  unsafe: [
    { character: '[', after: '\\[' },
    { character: '=', after: '=' },
    { character: '%', after: '%' },
    { character: '^', before: '(?:^|\\s)', after: '[A-Za-z0-9-]+(?:$|\\n)' }
  ],
  handlers
})

export default toMarkdown

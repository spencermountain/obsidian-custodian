import colors from './_lib/colors.ts'
import type { Handle, Options } from 'mdast-util-to-markdown'
import type { Paragraph, Blockquote, ListItem } from 'mdast'
import type { MarkdownNode } from '../../types/types.ts'
import { defaultHandlers } from 'mdast-util-to-markdown'
import { wikiMarkdown } from './_lib.ts'
import { joinSpacing } from './_lib/spacing.ts'

declare module 'mdast-util-to-markdown' {
  interface ConstructNameMap {
    inlineFootnote: 'inlineFootnote'
  }
}

const wiki: Handle = (node, parent, state) => {
  const value = wikiMarkdown(node as unknown as MarkdownNode)
  // An alias separator must not become a new table cell.
  return state.stack.includes('tableCell') ? value.replace(/\|/g, '\\|') : value
}

const highlight: Handle = (node, parent, state, info) => {
  // Give remark the delimiter context so it can escape nested text correctly.
  const content = state.containerPhrasing(node as Paragraph, { ...info, before: '=', after: '=' })
  const emoji = Object.keys(colors).find((marker) => colors[marker] === (node as unknown as MarkdownNode).color) || ''
  return `==${emoji}${content}==`
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
    const blanks = node.children?.[0]?.data?.blankLinesBefore ?? 0
    content += '\n'.repeat(blanks + 1) + body
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

const inlineFootnote: Handle = (node, parent, state, info) => {
  const exit = state.enter('inlineFootnote')
  const content = state.containerPhrasing(node as Paragraph, { ...info, before: '[', after: ']' })
  exit()
  return `^[${content}]`
}

const handlers: Record<string, Handle> = {
  inlineFootnote,
  tag: (node) => '#' + (node as unknown as MarkdownNode).value,
  wikiLink: wiki,
  embed: wiki,
  comment: (node) => `%%${(node as unknown as MarkdownNode).value}%%`,
  blockId: (node) => ` ^${(node as unknown as MarkdownNode).value}`,
  highlight,
  callout,
  listItem
}

const toMarkdown = (): Options => ({
  join: [joinSpacing],
  // Escape literal text that would otherwise be interpreted as Obsidian syntax.
  unsafe: [
    { character: '#' },
    { character: ']', inConstruct: 'inlineFootnote' },
    { character: '[', after: '\\[' },
    { character: '=', after: '=' },
    { character: '%', after: '%' },
    { character: '^', before: '(?:^|\\s)', after: '[A-Za-z0-9-]+(?:$|\\n)' }
  ],
  handlers
})

export default toMarkdown

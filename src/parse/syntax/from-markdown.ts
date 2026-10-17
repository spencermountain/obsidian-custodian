import type { Extension, Handle } from 'mdast-util-from-markdown'
import type { MarkdownNode } from '../../types/types.ts'
import { wikiFields } from './_lib.ts'

const types = {
  obsidianLink: 'wikiLink',
  obsidianEmbed: 'embed',
  obsidianComment: 'comment',
  obsidianHighlight: 'highlight',
  obsidianFootnote: 'inlineFootnote',
  obsidianTag: 'tag',
  obsidianCommentTail: 'commentTail'
}

// Translate micromark tokens into the custom nodes used by the API.
const fromMarkdown = (): Extension => {
  const enter: Record<string, Handle> = {}
  const exit: Record<string, Handle> = {}
  Object.entries(types).forEach(([tokenType, type]) => {
    // mdast handlers receive the compiler as their dynamic receiver.
    enter[tokenType] = function (token) {
      this.enter({ type, value: '' } as Parameters<typeof this.enter>[0], token)
    }
    exit[tokenType] = function (token) {
      const node = this.stack[this.stack.length - 1] as unknown as MarkdownNode
      const raw = this.sliceSerialize(token)
      // Delimiter widths differ for embeds, footnotes, and tags.
      const start = type === 'embed' ? 3 : 2
      if (type === 'tag') {
        node.value = raw.slice(1)
      } else if (type === 'commentTail') {
        node.value = raw
      } else if (type === 'inlineFootnote') {
        node.value = raw.slice(2, -1)
      } else {
        const closed = raw.length >= 4 && raw.endsWith('%%')
        const end = type === 'comment' && !closed ? undefined : -2
        node.value = raw.slice(start, end)
      }
      if (type === 'wikiLink' || type === 'embed') {
        // GFM tables require the alias separator to be written as \|.
        Object.assign(node, wikiFields(node.value.replace(/\\\|/g, '|')))
        delete node.value
      }
      this.exit(token)
    }
  })
  return { enter, exit }
}

export default fromMarkdown

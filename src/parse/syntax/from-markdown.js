import { wikiFields } from './_lib.js'

const types = {
  obsidianLink: 'wikiLink',
  obsidianEmbed: 'embed',
  obsidianComment: 'comment',
  obsidianHighlight: 'highlight'
}

// Translate micromark tokens into the custom nodes used by the API.
const fromMarkdown = () => {
  const enter = {}
  const exit = {}
  Object.entries(types).forEach(([tokenType, type]) => {
    // mdast handlers receive the compiler as their dynamic receiver.
    enter[tokenType] = function (token) {
      this.enter({ type, value: '' }, token)
    }
    exit[tokenType] = function (token) {
      const node = this.stack[this.stack.length - 1]
      const raw = this.sliceSerialize(token)
      // Embeds open with ![[; every other custom delimiter is two characters wide.
      const start = type === 'embed' ? 3 : 2
      node.value = raw.slice(start, -2)
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

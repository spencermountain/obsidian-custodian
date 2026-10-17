import { wikiFields } from './_lib.js'

const types = {
  obsidianLink: 'wikiLink', obsidianEmbed: 'embed',
  obsidianComment: 'comment', obsidianHighlight: 'highlight'
}
const fromMarkdown = () => {
  const enter = {}
  const exit = {}
  Object.entries(types).forEach(([tokenType, type]) => {
    // mdast handlers receive the compiler as their dynamic receiver.
    enter[tokenType] = function (token) { this.enter({ type, value: '' }, token) }
    exit[tokenType] = function (token) {
      const node = this.stack[this.stack.length - 1]
      const raw = this.sliceSerialize(token)
      const start = type === 'embed' ? 3 : 2
      node.value = raw.slice(start, -2)
      if (type === 'wikiLink' || type === 'embed') {
        Object.assign(node, wikiFields(node.value.replace(/\\\|/g, '|')))
        delete node.value
      }
      this.exit(token)
    }
  })
  return { enter, exit }
}

export default fromMarkdown

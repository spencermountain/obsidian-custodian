import { json } from './json.js'
import edit from './edit.js'
import outputTree from './_lib/output.js'
import text from './text.js'

// Keep the node private and route edits through the owning page's callbacks.
const createHandle = (node, { locate, changed, page }) => {
  const handle = {
    json: (options = {}) => {
      const tree = outputTree(node, options)
      return tree ? json(tree, options) : null
    },
    ast: (options = {}) => outputTree(node, options),
    text: (options = {}) => text(outputTree(node, options), options),
    update: (changes) => {
      // Reject stale handles before validating changes on a copy.
      locate(node)
      const next = edit(node, changes)
      // Preserve node identity so other handles to this item remain valid.
      Object.keys(node).forEach((key) => {
        delete node[key]
      })
      Object.assign(node, next)
      changed()
      return handle
    },
    remove: () => {
      const parent = locate(node)
      // A callout's title nodes live outside its body children.
      const children = parent.children.includes(node) ? parent.children : parent.title
      const index = children.indexOf(node)
      const following = children[index + 1]
      children.splice(index, 1)
      // Remove a separate block-ID paragraph along with the block it labels.
      if (node.blockId && following?.type === 'paragraph' && following.blockId === node.blockId) {
        children.splice(index, 1)
      }
      changed()
      return page
    }
  }
  return handle
}

export default createHandle

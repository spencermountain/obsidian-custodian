import { json } from './json.js'
import edit from './edit.js'
import outputTree from './output.js'
import text from './text.js'

const createHandle = (node, { locate, changed, page }) => {
  const handle = {
    json: (options = {}) => {
      const tree = outputTree(node, options)
      return tree ? json(tree, options) : null
    },
    ast: (options = {}) => outputTree(node, options),
    text: (options = {}) => text(outputTree(node, options), options),
    update: (changes) => {
      locate(node)
      const next = edit(node, changes)
      Object.keys(node).forEach((key) => { delete node[key] })
      Object.assign(node, next)
      changed()
      return handle
    },
    remove: () => {
      const parent = locate(node)
      const children = parent.children.includes(node) ? parent.children : parent.title
      const index = children.indexOf(node)
      const following = children[index + 1]
      children.splice(index, 1)
      if (node.blockId && following?.type === 'paragraph' && following.blockId === node.blockId) { children.splice(index, 1) }
      changed()
      return page
    }
  }
  return handle
}

export default createHandle

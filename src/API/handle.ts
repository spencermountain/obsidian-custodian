import type { MarkdownNode, NodeJSON, OutputOptions, EditChanges } from '../types.js'
import type Page from './Page.js'
import { json } from './json.js'
import edit from './edit.js'
import outputTree from './_lib/output.js'
import text from './text.js'

interface ItemHandle {
  json(options?: OutputOptions): NodeJSON | null
  ast(options?: OutputOptions): MarkdownNode | null
  text(options?: OutputOptions): string
  update(changes: EditChanges): ItemHandle
  remove(): Page
}

interface HandleContext {
  locate(node: MarkdownNode): MarkdownNode
  changed(): void
  page: Page
}

// Keep the node private and route edits through the owning page's callbacks.
const createHandle = (node: MarkdownNode, { locate, changed, page }: HandleContext): ItemHandle => {
  const handle: ItemHandle = {
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
        Reflect.deleteProperty(node, key)
      })
      Object.assign(node, next)
      changed()
      return handle
    },
    remove: () => {
      const parent = locate(node)
      // A callout's title nodes live outside its body children.
      const children = parent.children!.includes(node) ? parent.children! : parent.title as MarkdownNode[]
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

export type { ItemHandle }

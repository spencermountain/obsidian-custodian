import type { ParseOptions } from './types.js'
import parseMd from './parse/index.js'
import { makePage } from './API/Page.js'

// Keep parsing separate from the editable page and retain the original source.
const parsePage = (input: string, options: ParseOptions = {}) => {
  const { tree, source } = parseMd(input, options)
  return makePage(tree, source, options)
}

export type { ParseOptions, OutputOptions, EditChanges, MarkdownNode, DocumentNode, NodeJSON, PageJSON } from './types.js'
export type { ItemHandle } from './API/handle.js'
export type { default as Page } from './API/Page.js'
export default parsePage

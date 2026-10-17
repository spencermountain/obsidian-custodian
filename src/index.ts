import type { ParseOptions } from './types.ts'
import parseMd from './parse/index.ts'
import { makePage } from './API/Page.ts'

// Keep parsing separate from the editable page and retain the original source.
const parsePage = (input: string, options: ParseOptions = {}) => {
  const { tree, source } = parseMd(input, options)
  return makePage(tree, source, options)
}

export type {
  ParseOptions,
  OutputOptions,
  EditChanges,
  MarkdownNode,
  DocumentNode,
  NodeJSON,
  PageJSON
} from './types.ts'
export type { ItemHandle } from './API/handle.ts'
export type { default as Page } from './API/Page.ts'
export default parsePage

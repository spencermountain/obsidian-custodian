import type { ParseOptions } from './types/api.ts'
import parseMd from './parse/index.ts'
import { makePage } from './API/Page.ts'

// Keep parsing separate from the editable page and retain the original source.
const parsePage = (input: string, options: ParseOptions = {}) => {
  const { tree, source } = parseMd(input, options)
  return makePage(tree, source, options)
}

export type { ParseOptions, EditChanges, NodeJSON, PageJSON } from './types/api.ts'
export type { TextOptions, JsonOptions, MarkdownOptions, AstOptions, HtmlOptions } from './types/options.ts'
export type { AstNode, PageNode } from './types/ast.ts'
export type { default as ItemHandle, default as Section } from './API/Section/Section.ts'
export type * from './API/Section/types.ts'
export type { default as Page } from './API/Page.ts'
export default parsePage

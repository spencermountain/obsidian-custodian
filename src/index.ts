import type { ParseOptions } from './types/api.ts'
import parseMd from './parse/index.ts'
import { makePage } from './API/Page.ts'

// Keep parsing separate from the editable page and retain the original source.
const parsePage = (input: string, options: ParseOptions = {}) => {
  const { tree, source } = parseMd(input, options)
  return makePage(tree, source, options)
}

export type { ParseOptions, OutputOptions, EditChanges, NodeJSON, PageJSON } from './types/api.ts'
export type { AstNode, PageNode } from './types/ast.ts'
export type { default as ItemHandle, default as Section } from './API/Section/Section.ts'
export type { default as Link } from './API/Section/Link.ts'
export type { default as Embed } from './API/Section/Embed.ts'
export type { default as Callout } from './API/Section/Callout.ts'
export type { default as Page } from './API/Page.ts'
export default parsePage

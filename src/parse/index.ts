import type { ParseOptions, DocumentNode } from '../types.js'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkObsidian from './remark.js'

const parseMd = (input: string, options: ParseOptions = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Markdown must be a string')
  }
  // Fresh plugin state prevents one parse's settings or source from affecting another.
  const processor = unified().use(remarkParse).use(remarkObsidian, options)
  // parse() builds the tree; runSync() applies callouts and other Obsidian transforms.
  const tree = processor.runSync(processor.parse(input), { value: input }) as unknown as DocumentNode
  // Keep the source for exact round trips before the page is edited.
  return { tree, source: input }
}

export default parseMd

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkObsidian from './remark.js'

const parseMd = (input, options = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Markdown must be a string')
  }
  const processor = unified().use(remarkParse).use(remarkObsidian, options)
  // parse() builds the tree; runSync() applies callouts and other Obsidian transforms.
  const tree = processor.runSync(processor.parse(input), { value: input })
  return { tree, source: input }
}

export default parseMd

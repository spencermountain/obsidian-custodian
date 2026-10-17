import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkObsidian from './remark.js'

const createParser = (options = {}) => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkObsidian, options)
    .use(remarkStringify, { bullet: '-', ...options.markdown })

  return {
    parse: (source) => {
      if (typeof source !== 'string') { throw new TypeError('Markdown must be a string') }
      const tree = processor.runSync(processor.parse(source), { value: source })
      return { tree, source }
    },
    stringify: (tree) => processor.stringify(tree)
  }
}

export default createParser

import { unified } from 'unified'
import remarkStringify from 'remark-stringify'
import remarkObsidian from './remark.js'

const stringifyMd = (tree, options = {}) => {
  const processor = unified()
    .use(remarkStringify, { bullet: '-', ...options.markdown })
    .use(remarkObsidian, options)
  // The tree is already transformed. Only run the Markdown serializer.
  return processor.stringify(tree)
}

export default stringifyMd

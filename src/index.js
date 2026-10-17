import parseMd from './parse/index.js'
import { makePage } from './API/Page.js'

// Keep parsing separate from the editable page and retain the original source.
const parsePage = (input, options = {}) => {
  const { tree, source } = parseMd(input, options)
  return makePage(tree, source, options)
}

export default parsePage

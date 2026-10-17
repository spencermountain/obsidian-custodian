import parseMd from './parse/index.js'
import { makePage } from './API/Page.js'

const parsePage = (input, options = {}) => {
  const { tree, source } = parseMd(input, options)
  return makePage(tree, source, options)
}

export default parsePage

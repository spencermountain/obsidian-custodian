import createParser from './parser.js'
import createPage from './page/index.js'

const parsePage = (input, options = {}) => {
  const parser = createParser(options)
  return createPage(parser.parse(input), parser)
}

export default parsePage

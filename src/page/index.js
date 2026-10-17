import createParser from '../parser.js'
import Page from './Page.js'

const createPage = (document, codec = createParser()) => new Page(document, codec)

export default createPage

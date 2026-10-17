import test from 'tape'
import parsePage from './lib.js'
import readFile from './examples/index.js'

// Check independent expectations both before and after actual serialization.
const fixture = (name, verify) => {
  test(name, (t) => {
    const input = readFile(name)
    const page = parsePage(input)
    t.equal(page.markdown(), input, 'untouched source is preserved')
    t.comment('parsed fixture')
    verify(t, page)
    // Mark the page edited without changing its content, bypassing the source cache.
    page.append('')
    const reparsed = parsePage(page.markdown())
    t.comment('serialized and reparsed fixture')
    verify(t, reparsed)
    t.end()
  })
}

// Inspect standard Markdown nodes that do not have dedicated collection methods.
const nodes = (page, type) => {
  const found = []
  const visit = (node) => {
    if (node.type === type) { found.push(node) }
    node.children?.forEach(visit)
    if (Array.isArray(node.title)) { node.title.forEach(visit) }
  }
  visit(page.ast())
  return found
}

const values = (page, type) => nodes(page, type).map((node) => node.value)

export { fixture, nodes, values }

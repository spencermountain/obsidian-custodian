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

export { nodes, values }

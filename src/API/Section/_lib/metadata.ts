// Copy only the fields owned by a section, leaving AST children private.
const metadata = (result, node, fields: string[]) => {
  if (!result) { return null }
  fields.forEach(key => {
    if (node[key] !== undefined && (key !== 'title' || typeof node.title === 'string')) {
      result[key] = structuredClone(node[key])
    }
  })
  return result
}

export default metadata

import { CORE_SCHEMA, loadAll } from 'js-yaml'

const options = { schema: CORE_SCHEMA, maxAliases: 100 }

// Keep malformed YAML editable, and report failures without discarding its source.
const properties = (value: string) => {
  try {
    // loadAll accepts empty/comment-only YAML; frontmatter still permits one document.
    const documents = loadAll(value, options)
    if (documents.length > 1) {
      return { propertiesError: 'Expected a single YAML document' }
    }
    return { properties: documents[0] ?? null }
  } catch (error) {
    return { propertiesError: error.message }
  }
}

export default properties

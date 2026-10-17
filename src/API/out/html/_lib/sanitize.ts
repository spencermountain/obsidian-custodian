import { sanitize, defaultSchema } from 'hast-util-sanitize'
import type { Schema } from 'hast-util-sanitize'

// Keep the default URL and script protections, plus our presentation attributes.
const schema: Schema = {
  ...defaultSchema,
  tagNames: [...defaultSchema.tagNames, 'mark'],
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...defaultSchema.attributes.a.filter((attribute) => !Array.isArray(attribute) || attribute[0] !== 'className'),
      ['className', 'data-footnote-backref', 'internal-link', 'internal-embed'],
      'dataHref'
    ],
    div: [...defaultSchema.attributes.div, ['className', 'callout', 'callout-title', 'callout-content'], 'dataCallout'],
    details: [['className', 'callout'], 'dataCallout'],
    summary: [...defaultSchema.attributes.summary, ['className', 'callout-title']],
    span: [['className', 'tag', 'obsidian-comment']],
    mark: ['dataColor'],
    code: [['className', /^language-./, 'math-inline', 'math-display']]
  }
}

const clean = (tree) => {
  // Sanitization prefixes IDs; keep fragment links aimed at those same IDs.
  const visit = (node) => {
    if (node.type === 'element' && typeof node.properties?.href === 'string' && node.properties.href.startsWith('#')) {
      node.properties.href = '#' + defaultSchema.clobberPrefix + node.properties.href.slice(1)
    }
    node.children?.forEach(visit)
  }
  visit(tree)
  return sanitize(tree, schema)
}

export default clean

import type { Collection, Predicate } from '../../types/types.ts'

// Shared category names for selectors, JSON collections, and output exclusions.
const groups: Record<Collection, Predicate> = {
  headings: (node) => node.type === 'heading',
  paragraphs: (node) => node.type === 'paragraph',
  links: (node) => ['wikiLink', 'link', 'linkReference'].includes(node.type),
  embeds: (node) => ['embed', 'image', 'imageReference'].includes(node.type),
  tasks: (node) => node.type === 'listItem' && typeof node.checked === 'boolean',
  lists: (node) => node.type === 'list',
  callouts: (node) => node.type === 'callout',
  highlights: (node) => node.type === 'highlight',
  comments: (node) => node.type === 'comment',
  code: (node) => node.type === 'code',
  math: (node) => ['math', 'inlineMath'].includes(node.type),
  tables: (node) => node.type === 'table',
  frontmatter: (node) => node.type === 'yaml',
  tags: (node) => node.type === 'tag',
  footnotes: (node) => ['footnoteDefinition', 'inlineFootnote'].includes(node.type)
}

export default groups

import type { TextOptions } from '../../types/options.ts'

// Defaults for text output; callers can override individual categories.
const defaults: Required<TextOptions> = {
  paragraphs: true,
  headings: true,
  links: 'text',
  embeds: false,
  tasks: true,
  lists: true,
  callouts: 'body',
  highlights: 'text',
  comments: false,
  code: true,
  math: true,
  tables: false,
  frontmatter: false,
  footnotes: true,
  tags: true,
  blockIds: false,
  html: false,
  quotes: true,
  thematicBreaks: true,
  definitions: true
}

export default defaults

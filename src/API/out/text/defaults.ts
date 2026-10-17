import type { TextOptions } from '../../../types/options.ts'

// Defaults for text output; callers can override individual categories.
const defaults: Required<TextOptions> = {
  paragraphs: true,
  headings: 'inline',
  links: true,
  embeds: true,
  tasks: true,
  lists: true,
  callouts: true,
  highlights: true,
  comments: false,
  code: true,
  math: true,
  tables: true,
  frontmatter: true,
  footnotes: true,
  tags: true,
  blockIds: false,
  html: true,
  quotes: true,
  thematicBreaks: true,
  definitions: true
}

export default defaults

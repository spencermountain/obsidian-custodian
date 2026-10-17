import type { HtmlOptions } from '../../../types/options.ts'

// Defaults for html output; callers can override individual categories.
const defaults: Required<HtmlOptions> = {
  paragraphs: true,
  headings: true,
  links: true,
  embeds: true,
  tasks: true,
  lists: true,
  callouts: true,
  highlights: true,
  comments: true,
  code: true,
  math: true,
  tables: true,
  frontmatter: true,
  footnotes: true,
  tags: true,
  blockIds: true,
  html: true,
  quotes: true,
  thematicBreaks: true,
  definitions: true
}

export default defaults

// Structural outputs only include or exclude each category.
interface AstOptions {
  paragraphs?: boolean
  headings?: boolean
  links?: boolean
  embeds?: boolean
  tasks?: boolean
  lists?: boolean
  callouts?: boolean
  highlights?: boolean
  comments?: boolean
  code?: boolean
  math?: boolean
  tables?: boolean
  frontmatter?: boolean
  footnotes?: boolean
  tags?: boolean
  blockIds?: boolean
  html?: boolean
  quotes?: boolean
  thematicBreaks?: boolean
  definitions?: boolean
}

type JsonOptions = AstOptions

// Add format-specific modes here as their renderers gain support.
interface TextOptions extends Omit<AstOptions, 'headings' | 'callouts'> {
  headings?: boolean | 'inline'
  callouts?: boolean | 'body'
}

interface MarkdownOptions extends Omit<AstOptions, 'headings' | 'callouts'> {
  headings?: boolean | 'inline'
  callouts?: boolean | 'body'
}

// HTML uses the same inclusion keys with its own presentation modes.
interface HtmlOptions extends Omit<AstOptions, 'headings' | 'callouts'> {
  headings?: boolean | 'inline'
  callouts?: boolean | 'body'
}

type OutputOptions = TextOptions | MarkdownOptions | JsonOptions | AstOptions | HtmlOptions

export type { TextOptions, JsonOptions, HtmlOptions, AstOptions, MarkdownOptions, OutputOptions }

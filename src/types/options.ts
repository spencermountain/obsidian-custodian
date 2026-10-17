// Structural outputs only include or exclude each category.
interface AstOptions {
  blockIds?: boolean
  callouts?: boolean
  code?: boolean
  comments?: boolean
  definitions?: boolean
  embeds?: boolean
  footnotes?: boolean
  frontmatter?: boolean
  headings?: boolean
  highlights?: boolean
  html?: boolean
  links?: boolean
  lists?: boolean
  math?: boolean
  paragraphs?: boolean
  quotes?: boolean
  tables?: boolean
  tags?: boolean
  tasks?: boolean
  thematicBreaks?: boolean
}

type JsonOptions = AstOptions

// Add format-specific modes here as their renderers gain support.
interface TextOptions {
  links?: boolean | 'text'
  headings?: boolean | 'inline'
  highlights?: boolean | 'text'
  callouts?: boolean | 'body'
  blockIds?: boolean
  code?: boolean
  comments?: boolean
  definitions?: boolean
  embeds?: boolean
  footnotes?: boolean
  frontmatter?: boolean
  html?: boolean
  lists?: boolean
  math?: boolean
  paragraphs?: boolean
  quotes?: boolean
  tables?: boolean
  tags?: boolean
  tasks?: boolean
  thematicBreaks?: boolean
}

interface MarkdownOptions {
  headings?: boolean | 'inline'
  callouts?: boolean | 'body'
  blockIds?: boolean
  code?: boolean
  comments?: boolean
  definitions?: boolean
  embeds?: boolean
  footnotes?: boolean
  frontmatter?: boolean
  highlights?: boolean
  html?: boolean
  links?: boolean
  lists?: boolean
  math?: boolean
  paragraphs?: boolean
  quotes?: boolean
  tables?: boolean
  tags?: boolean
  tasks?: boolean
  thematicBreaks?: boolean
}

// HTML uses the same inclusion keys with its own presentation modes.
interface HtmlOptions {
  headings?: boolean | 'inline'
  callouts?: boolean | 'body'
  blockIds?: boolean
  code?: boolean
  comments?: boolean
  definitions?: boolean
  embeds?: boolean
  footnotes?: boolean
  frontmatter?: boolean
  highlights?: boolean
  html?: boolean
  links?: boolean
  lists?: boolean
  math?: boolean
  paragraphs?: boolean
  quotes?: boolean
  tables?: boolean
  tags?: boolean
  tasks?: boolean
  thematicBreaks?: boolean
}

type OutputOptions = TextOptions | MarkdownOptions | JsonOptions | AstOptions | HtmlOptions

export type { TextOptions, JsonOptions, HtmlOptions, AstOptions, MarkdownOptions, OutputOptions }

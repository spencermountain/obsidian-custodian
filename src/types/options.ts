interface TextOptions {
  paragraphs?: boolean
  headings?: boolean | 'inline'
  links?: boolean
  embed?: boolean
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
}

interface JsonOptions {
  paragraphs?: boolean
  headings?: boolean
  links?: boolean
  embed?: boolean
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
}

interface HtmlOptions {
  paragraphs?: boolean
  headings?: boolean
  links?: boolean
  embed?: boolean
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
}
interface AstOptions {
  paragraphs?: boolean
  headings?: boolean
  links?: boolean
  embed?: boolean
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
}

interface MarkdownOptions {
  paragraphs?: boolean
  headings?: boolean
  links?: boolean
  embed?: boolean
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
}
export type { TextOptions, JsonOptions, HtmlOptions, AstOptions, MarkdownOptions }

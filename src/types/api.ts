export type {
  TextOptions,
  JsonOptions,
  HtmlOptions,
  AstOptions,
  MarkdownOptions,
  OutputOptions
} from './options.ts'

// Keep API options and JSON payloads open while their shapes are evolving.
interface ParseOptions {
  gfm?: object
  math?: object
  markdown?: object
}

type EditChanges = Record<string, any>
type Collection = string
type NodeJSON = Record<string, any>

interface PageJSON {
  text: string
  paragraphs: object
  headings: object
  links: object
  embeds: object
  tasks: object
  lists: object
  callouts: object
  highlights: object
  comments: object
  code: object
  math: object
  tables: object
  frontmatter: object
  footnotes: object
  tags: object
}

export type { ParseOptions, EditChanges, Collection, NodeJSON, PageJSON }

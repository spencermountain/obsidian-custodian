import type { Options as GfmOptions } from 'remark-gfm'
import type { Options as MathOptions } from 'remark-math'
import type { Options as MarkdownOptions } from 'remark-stringify'

interface ParseOptions {
  gfm?: GfmOptions
  math?: MathOptions
  markdown?: MarkdownOptions
}

type Collection = 'headings' | 'paragraphs' | 'links' | 'embeds' | 'tasks' | 'lists' |
  'callouts' | 'highlights' | 'comments' | 'code' | 'math' | 'tables' | 'frontmatter' | 'footnotes'
type OutputOptions = Partial<Record<Collection | 'blockIds' | 'html' | 'calloutTitles', boolean>>
type Fold = 'expanded' | 'collapsed' | null
type NodeType = 'root' | 'paragraph' | 'heading' | 'text' | 'strong' | 'emphasis' | 'delete' |
  'break' | 'blockquote' | 'list' | 'listItem' | 'link' | 'linkReference' | 'image' |
  'imageReference' | 'definition' | 'footnoteDefinition' | 'footnoteReference' | 'code' |
  'inlineCode' | 'math' | 'inlineMath' | 'yaml' | 'html' | 'thematicBreak' | 'table' |
  'tableRow' | 'tableCell' | 'wikiLink' | 'embed' | 'comment' | 'highlight' | 'blockId' | 'callout'

interface Point { line: number; column: number; offset?: number }
interface Position { start: Point; end: Point }

// A structural view covering CommonMark, GFM, and our custom Obsidian nodes.
interface MarkdownNode {
  type: NodeType
  children?: MarkdownNode[]
  title?: string | MarkdownNode[] | null
  position?: Position
  data?: Record<string, unknown>
  value?: string
  depth?: number
  target?: string
  alias?: string | null
  heading?: string | null
  block?: string | null
  url?: string
  alt?: string | null
  checked?: boolean | null
  taskMarker?: string
  ordered?: boolean
  start?: number | null
  spread?: boolean
  lang?: string | null
  meta?: string | null
  identifier?: string
  label?: string | null
  referenceType?: 'full' | 'collapsed' | 'shortcut'
  blockId?: string
  calloutType?: string
  fold?: Fold
  align?: Array<'left' | 'right' | 'center' | null>
}

interface DocumentNode extends MarkdownNode {
  type: 'root'
  children: MarkdownNode[]
}

interface NodeJSON extends Omit<MarkdownNode, 'children' | 'title' | 'data'> {
  text: string
  title?: string
  width?: number
  height?: number
  rows?: string[][]
  items?: Array<{ text: string; checked: boolean | null }>
}

type PageJSON = Record<Collection, NodeJSON[]> & { text: string; blocks: NodeJSON[] }
type Predicate = (node: MarkdownNode, parent: MarkdownNode | null) => boolean

interface EditChanges {
  text?: string
  depth?: number
  target?: string
  alias?: string | null
  heading?: string | null
  block?: string | null
  url?: string
  alt?: string
  title?: string | null
  checked?: boolean
  calloutType?: string
  fold?: Fold
  value?: string
  lang?: string | null
  meta?: string | null
}

export type {
  ParseOptions, OutputOptions, Collection, Fold, NodeType, Position,
  MarkdownNode, DocumentNode, NodeJSON, PageJSON, Predicate, EditChanges
}

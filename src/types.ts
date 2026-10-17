// Keep changing API payloads open; only traversal needs a small shared shape.
type ParseOptions = Record<string, any>
type OutputOptions = Record<string, boolean>
type EditChanges = Record<string, any>
type Collection = string
type NodeType = string

interface MarkdownNode {
  type: string
  children?: MarkdownNode[]
  [key: string]: any
}

interface DocumentNode extends MarkdownNode {
  children: MarkdownNode[]
}

type NodeJSON = Record<string, any>
type PageJSON = Record<string, any>
type Predicate = (node: MarkdownNode, parent: MarkdownNode | null) => boolean

export type {
  ParseOptions, OutputOptions, EditChanges, Collection, NodeType,
  MarkdownNode, DocumentNode, NodeJSON, PageJSON, Predicate
}

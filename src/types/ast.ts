// Traversal needs only a small shared shape; individual nodes can add fields.
type NodeType = string

interface AstNode {
  type: NodeType
  children?: AstNode[]
  [key: string]: any
}

interface PageNode extends AstNode {
  children: AstNode[]
}

type Predicate = (node: AstNode, parent: AstNode | null) => boolean

export type { NodeType, AstNode, PageNode, Predicate }

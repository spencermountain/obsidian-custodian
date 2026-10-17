import type Section from './Section.ts'
import type { SectionContext } from './Section.ts'
import type { AstNode } from '../../types/ast.ts'

// Shared by the factory and renderers, without importing subclasses into their base.
const classes = new Map<string, typeof Section>()

const register = (type: string, Constructor: typeof Section) => {
  classes.set(type, Constructor)
}

const createSection = (node: AstNode, context: SectionContext = {}): Section => {
  const Constructor = classes.get(node.type) || classes.get('*')
  return new Constructor(node, context)
}

export { register, createSection }

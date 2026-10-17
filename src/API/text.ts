import type { MarkdownNode, OutputOptions } from '../types/types.ts'
import { createSection } from './Section/registry.ts'

// Nested nodes use the same overrides as sections returned by Page selectors.
const text = (node: MarkdownNode | null, options: OutputOptions = {}): string => {
  if (!node) { return '' }
  return createSection(node).text(options)
}

export default text

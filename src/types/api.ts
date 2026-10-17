export type { TextOptions, JsonOptions, HtmlOptions, AstOptions } from './options.ts'

// Keep API options and JSON payloads open while their shapes are evolving.
type ParseOptions = Record<string, any>

type EditChanges = Record<string, any>
type Collection = string
type NodeJSON = Record<string, any>
type PageJSON = Record<string, any>

export type { ParseOptions, EditChanges, Collection, NodeJSON, PageJSON }

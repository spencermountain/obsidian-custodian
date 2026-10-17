// Build HTML nodes rather than interpolating unescaped user content.
const text = (value: string) => ({ type: 'text' as const, value })
const element = (tagName: string, properties: Record<string, any> = {}, children: any[] = []) => ({
  type: 'element' as const,
  tagName,
  properties,
  children
})

export { text, element }

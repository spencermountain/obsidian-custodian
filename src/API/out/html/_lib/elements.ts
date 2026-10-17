// Escape both text and attribute values; only renderer-owned markup is emitted.
const text = (value: unknown = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const element = (tag: string, properties: Record<string, any> = {}, children: string | string[] = '') => {
  const attributes = Object.entries(properties).flatMap(([key, value]) => {
    if (value === false || value == null) {
      return []
    }
    const name = key === 'className' ? 'class' : key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase())
    if (value === true) {
      return [' ' + name]
    }
    const content = Array.isArray(value) ? value.join(' ') : value
    return [` ${name}="${text(content)}"`]
  }).join('')
  const opening = `<${tag}${attributes}>`
  if (['img', 'input', 'br', 'hr'].includes(tag)) {
    return opening
  }
  const content = Array.isArray(children) ? children.join('') : children
  return `${opening}${content}</${tag}>`
}

// Browser URL parsing ignores control characters inside protocol names.
const url = (value: string = '', image = false): string | undefined => {
  const normalized = value.replace(/[\u0000-\u0020\u007f-\u009f]/g, '')
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(normalized)?.[1].toLowerCase()
  const allowed = image ? ['http', 'https'] : ['http', 'https', 'mailto', 'tel', 'irc', 'ircs', 'xmpp']
  if (scheme && !allowed.includes(scheme)) {
    return undefined
  }
  if (value.startsWith('#')) {
    return '#user-content-' + value.slice(1)
  }
  return value
}

export { text, element, url }

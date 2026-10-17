const callout = (node) => {
  const paragraph = node.children[0]
  const first = paragraph?.children?.[0]
  if (first?.type !== 'text') { return }
  const match = /^\[!([\w-]+)\]([+-]?)[ \t]*/.exec(first.value)
  if (!match) { return }

  first.value = first.value.slice(match[0].length)
  const title = []
  const body = []
  let inBody = false
  // The first line is the title; preserve its inline formatting separately.
  paragraph.children.forEach((child) => {
    if (!inBody && child.type === 'text' && /[\r\n]/.test(child.value)) {
      const index = child.value.search(/[\r\n]/)
      title.push({ ...child, value: child.value.slice(0, index) })
      body.push({ ...child, value: child.value.slice(index).replace(/^\r?\n/, '') })
      inBody = true
    } else if (inBody) {
      body.push(child)
    } else {
      title.push(child)
    }
  })
  node.type = 'callout'
  node.calloutType = match[1].toLowerCase()
  node.fold = null
  if (match[2]) { node.fold = match[2] === '-' ? 'collapsed' : 'expanded' }
  node.title = title
  node.children = node.children.slice(1)
  if (body.length) { node.children.unshift({ type: 'paragraph', children: body }) }
}

export default callout

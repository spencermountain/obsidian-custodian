import { dimensions } from '../../../../parse/syntax/_lib.ts'
import { defaultHandlers } from 'mdast-util-to-hast'
import { element, text } from './elements.ts'

const destination = (node) => {
  let value = node.target || ''
  if (node.heading != null) {
    value += '#' + node.heading
  } else if (node.block != null) {
    value += '#^' + node.block
  }
  return value
}

const wikiLink = (state, node) => {
  const target = destination(node)
  let href = encodeURI(target)
  if (!node.target && node.block) {
    href = '#block-' + encodeURIComponent(node.block)
  }
  return element('a', { href, className: ['internal-link'], dataHref: target }, [
    text(node.alias ?? target)
  ])
}

const embed = (state, node) => {
  // Images can render locally; notes and other attachments need a vault resolver.
  if (/\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(node.target)) {
    const size = dimensions(node.alias ?? '')
    return element('img', {
      src: encodeURI(destination(node)),
      alt: Object.keys(size).length ? node.target : node.alias ?? node.target,
      ...size
    })
  }
  const link = wikiLink(state, node)
  link.properties = { ...link.properties, className: ['internal-embed'] }
  return link
}

const image = (state, node) => {
  const result = defaultHandlers.image(state, node) as any
  const parts = (node.alt || '').split('|')
  const size = dimensions(parts.at(-1))
  if (parts.length > 1 && Object.keys(size).length) {
    result.properties = { ...result.properties, ...size, alt: parts.slice(0, -1).join('|') }
  }
  return result
}

export { wikiLink, embed, image }

import { dimensions } from '../../../../parse/syntax/_lib.ts'
import { normalize } from '../../../ast/references.ts'
import { element, text, url } from './elements.ts'

const destination = (node) => {
  let value = node.target || ''
  if (node.heading != null) {
    value += '#' + node.heading
  } else if (node.block != null) {
    value += '#^' + node.block
  }
  return value
}

const wikiLink = (state, node, className = 'internal-link') => {
  const target = destination(node)
  let href = encodeURI(target)
  if (!node.target && node.block) {
    href = '#block-' + encodeURIComponent(node.block)
  }
  return element('a', { href: url(href), className, dataHref: target }, text(node.alias ?? target))
}

const embed = (state, node) => {
  if (/\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(node.target)) {
    const size = dimensions(node.alias ?? '')
    return element('img', {
      src: url(encodeURI(destination(node)), true),
      alt: Object.keys(size).length ? node.target : node.alias ?? node.target,
      ...size
    })
  }
  return wikiLink(state, node, 'internal-embed')
}

const image = (state, node) => {
  const parts = (node.alt || '').split('|')
  const size = dimensions(parts.at(-1))
  let alt = node.alt || ''
  if (parts.length > 1 && Object.keys(size).length) {
    alt = parts.slice(0, -1).join('|')
  }
  return element('img', { src: url(node.url, true), alt, title: node.title, ...size })
}

const link = (state, node) => element('a', {
  href: url(node.url), title: node.title
}, state.all(node))

const reference = (state, node) => {
  const definition = state.definitions.get(normalize(node.identifier))
  if (!definition) {
    return node.type === 'imageReference' ? text(node.alt || '') : state.all(node)
  }
  const resolved = { ...node, url: definition.url, title: definition.title }
  return node.type === 'imageReference' ? image(state, resolved) : link(state, resolved)
}

export { wikiLink, embed, image, link, reference }

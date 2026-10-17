import { defaultHandlers } from 'mdast-util-to-hast'
import type { Handler } from 'mdast-util-to-hast'
import type { HtmlOptions } from '../../../../types/options.ts'
import { element, text } from './elements.ts'
import { wikiLink, embed, image } from './links.ts'
import callout from './callout.ts'

const handlers = (options: HtmlOptions): Record<string, Handler> => ({
  wikiLink,
  embed,
  image,
  callout,
  heading: (state, node) => {
    if (options.headings === 'inline') {
      return state.all(node)
    }
    return defaultHandlers.heading(state, node)
  },
  highlight: (state, node: any) => {
    const properties = node.color ? { dataColor: node.color } : {}
    return element('mark', properties, state.all(node))
  },
  tag: (state, node: any) => element('span', { className: ['tag'] }, [text('#' + node.value)]),
  comment: (state, node: any) => element('span', { className: ['obsidian-comment'] }, [text(node.value)]),
  blockId: (state, node: any) => element('span', { id: 'block-' + node.value }),
  yaml: (state, node) => element('pre', {}, [
    element('code', { className: ['language-yaml'] }, [text(node.value)])
  ]),
  math: (state, node: any) => element('pre', {}, [
    element('code', { className: ['language-math', 'math-display'] }, [text(node.value)])
  ]),
  inlineMath: (state, node: any) => element('code', {
    className: ['language-math', 'math-inline']
  }, [text(node.value)])
})

export default handlers

import { wikiMarkdown } from './_lib.js'

const inTable = (value, state) => state.stack.includes('tableCell') ? value.replace(/\|/g, '\\|') : value
const wiki = (node, parent, state) => inTable(wikiMarkdown(node), state)
const toMarkdown = () => ({
  unsafe: [
    { character: '[', after: '\\[' },
    { character: '=', after: '=' },
    { character: '%', after: '%' },
    { character: '^', before: '(?:^|\\s)', after: '[A-Za-z0-9-]+(?:$|\\n)' }
  ],
  handlers: {
    wikiLink: wiki,
    embed: wiki,
    comment: (node) => `%%${node.value}%%`,
    highlight: (node, parent, state, info) => `==${state.containerPhrasing(node, { ...info, before: '=', after: '=' })}==`
  }
})

export default toMarkdown

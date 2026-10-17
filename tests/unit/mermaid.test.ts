import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'
const here = '[mermaid] '
const examples = [
  ['mermaid', [
    'sequenceDiagram',
    '    Alice->>+John: Hello John, how are you?',
    '    Alice->>+John: John, can you hear me?',
    '    John-->>-Alice: Hi Alice, I can hear you!',
    '    John-->>-Alice: I feel great!'
  ].join('\n')],
  ['mermaid-links', 'graph TD\n\nBiology --> Chemistry\n\nclass Biology,Chemistry internal-link;']
]

examples.forEach(([name, expected]) => {
  test(`mermaid/${name}`, (t) => {
    const md = readFile(`mermaid/${name}`)
    const page = parsePage(md)
    const code = page.code().map((block) => block.json())

    t.equal(code.length, 1, `${here} ${name} one-code-block`)
    t.equal(code[0]?.lang, 'mermaid', `${here} ${name} language`)
    t.equal(code[0]?.value, expected, `${here} ${name} literal-content`)
    t.equal(page.links().length, 0, `${here} ${name} no-markdown-links`)
    t.deepEqual(page.json().code, code, `${here} ${name} json-code`)
    t.equal(page.markdown(), md, `${here} ${name} output-same`)
    t.end()
  })
})

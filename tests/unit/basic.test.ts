import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'
const here = '[basic] '

test('basic/headings', (t) => {
  const md = readFile('basic/headings')
  const page = parsePage(md)
  const headings = page.headings().map((heading) => heading.json())

  t.equal(headings.length, 6, `${here} six-headings`)
  t.deepEqual(headings.map((heading) => heading.depth), [1, 2, 3, 4, 5, 6], `${here} heading-depths`)
  t.deepEqual(headings.map((heading) => heading.text), [
    'This is a heading 1', 'This is a heading 2', 'This is a heading 3',
    'This is a heading 4', 'This is a heading 5', 'This is a heading 6'
  ], `${here} heading-text`)
  t.deepEqual(page.json().headings, headings, `${here} json-headings`)
  t.equal(page.markdown(), md, `${here} output-same`)
  t.end()
})

test('basic/front-matter', (t) => {
  const md = readFile('basic/front-matter')
  const page = parsePage(md)
  const json = page.json()

  t.equal(json.frontmatter.length, 1, `${here} one-frontmatter`)
  t.equal(json.frontmatter[0]?.value, 'tags:\n  - recipe\n  - cooking', `${here} yaml-content`)
  t.deepEqual(page.paragraphs().map((paragraph) => paragraph.json().text), ['below text'], `${here} body-text`)
  t.equal(page.headings().length, 0, `${here} zero-headings`)
  t.equal(page.lists().length, 0, `${here} yaml-is-not-a-list`)
  t.equal(page.markdown(), md, `${here} output-same`)
  t.end()
})

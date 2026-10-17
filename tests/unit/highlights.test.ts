import { nodes, values } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'

test('highlights/inline-highlights', (t) => {
  const input = readFile('highlights/inline-highlights')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(
    page.highlights().map((item) => item.text()),
    [
      'highlighted text',
      'Bold inside a highlight',
      'a highlighted link',
      'A highlight containing == as code'
    ],
    'highlight content'
  )
  t.equal(nodes(page, 'strong')[0]?.children[0]?.value, 'Bold inside a highlight', 'nested bold')
  t.deepEqual(
    page.links().map((item) => [item.json().target, item.json().alias]),
    [['Note', 'a highlighted link']],
    'nested wikilink'
  )
  t.deepEqual(values(page, 'inlineCode'), ['=='], 'code delimiter does not close the highlight')
  t.end()
})

test('highlights/inline-highlights - serialized and reparsed', (t) => {
  const input = readFile('highlights/inline-highlights')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(
    page.highlights().map((item) => item.text()),
    [
      'highlighted text',
      'Bold inside a highlight',
      'a highlighted link',
      'A highlight containing == as code'
    ],
    'highlight content'
  )
  t.equal(nodes(page, 'strong')[0]?.children[0]?.value, 'Bold inside a highlight', 'nested bold')
  t.deepEqual(
    page.links().map((item) => [item.json().target, item.json().alias]),
    [['Note', 'a highlighted link']],
    'nested wikilink'
  )
  t.deepEqual(values(page, 'inlineCode'), ['=='], 'code delimiter does not close the highlight')
  t.end()
})

test('highlight fragments retain block-like punctuation and colors', (t) => {
  const page = parsePage('==# literal heading marker== ==- literal list marker== ==🔴Important==')
  t.deepEqual(page.highlights().map(item => item.text()), ['# literal heading marker', '- literal list marker', 'Important'])
  t.equal(page.highlights()[2]?.json().color, 'red')
  page.append('')
  const reparsed = parsePage(page.markdown())
  t.deepEqual(reparsed.highlights().map(item => item.text()), ['# literal heading marker', '- literal list marker', 'Important'])
  t.equal(reparsed.highlights()[2]?.json().color, 'red')
  t.end()
})

test('all highlight colors survive edits and HTML remains literal', (t) => {
  const page = parsePage('==🔴red== ==🟠orange== ==🟡yellow== ==🟢green== ==🔵blue== ==🟣purple==')
  t.deepEqual(page.highlights().map(item => item.json().color), ['red', 'orange', 'yellow', 'green', 'blue', 'purple'])
  page.highlights()[0].update({ text: 'changed' })
  const reparsed = parsePage(page.markdown())
  t.equal(reparsed.highlights()[0]?.json().color, 'red')
  t.equal(reparsed.highlights()[0]?.text(), 'changed')
  const html = parsePage('==<span>[[literal]]</span>==')
  t.equal(html.links().length, 0)
  t.end()
})

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

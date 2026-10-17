import { nodes, values } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'
const here = '[tables] '
const examples = [
  ['simple-table', {
    align: [null, null],
    rows: [['First name', 'Last name'], ['Max', 'Planck'], ['Marie', 'Curie']]
  }],
  ['aligned-table', {
    align: ['left', 'center', 'right'],
    rows: [['Left-aligned text', 'Center-aligned text', 'Right-aligned text'], ['Content', 'Content', 'Content']]
  }]
]

examples.forEach(([name, expected]) => {
  test(`tables/${name}`, (t) => {
    const md = readFile(`tables/${name}`)
    const page = parsePage(md)
    const tables = page.tables().map((table) => table.json())

    t.equal(tables.length, 1, `${here} ${name} one-table`)
    t.deepEqual(tables[0]?.align, expected.align, `${here} ${name} alignment`)
    t.deepEqual(tables[0]?.rows, expected.rows, `${here} ${name} rows`)
    t.deepEqual(page.json().tables, tables, `${here} ${name} json-tables`)
    t.equal(page.markdown(), md, `${here} ${name} output-same`)
    t.end()
  })
})

test('tables/inline-formatting', (t) => {
  const input = readFile('tables/inline-formatting')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(page.tables().length, 1, 'one table')
  t.deepEqual(page.tables()[0]?.json().rows, [
    ['Feature', 'Example'], ['Emphasis', 'Bold and italic'], ['Deletion', 'Old text'],
    ['Code', 'const x = 1'], ['Link', 'Example'], ['Highlight', 'Important']
  ], 'cell contents with inline formatting removed')
  t.deepEqual(page.tables()[0]?.json().align, [null, null], 'default alignment')
  t.equal(nodes(page, 'strong').length, 1, 'bold cell span')
  t.equal(nodes(page, 'emphasis').length, 1, 'italic cell span')
  t.equal(nodes(page, 'delete').length, 1, 'strikethrough cell span')
  t.deepEqual(values(page, 'inlineCode'), ['const x = 1'], 'inline code cell')
  t.deepEqual(page.links().map((item) => item.json().url), ['https://example.com'], 'link cell')
  t.deepEqual(page.highlights().map((item) => item.text()), ['Important'], 'highlight cell')
  t.end()
})

test('tables/inline-formatting - serialized and reparsed', (t) => {
  const input = readFile('tables/inline-formatting')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(page.tables().length, 1, 'one table')
  t.deepEqual(page.tables()[0]?.json().rows, [
    ['Feature', 'Example'], ['Emphasis', 'Bold and italic'], ['Deletion', 'Old text'],
    ['Code', 'const x = 1'], ['Link', 'Example'], ['Highlight', 'Important']
  ], 'cell contents with inline formatting removed')
  t.deepEqual(page.tables()[0]?.json().align, [null, null], 'default alignment')
  t.equal(nodes(page, 'strong').length, 1, 'bold cell span')
  t.equal(nodes(page, 'emphasis').length, 1, 'italic cell span')
  t.equal(nodes(page, 'delete').length, 1, 'strikethrough cell span')
  t.deepEqual(values(page, 'inlineCode'), ['const x = 1'], 'inline code cell')
  t.deepEqual(page.links().map((item) => item.json().url), ['https://example.com'], 'link cell')
  t.deepEqual(page.highlights().map((item) => item.text()), ['Important'], 'highlight cell')
  t.end()
})

test('tables/escaped-pipes', (t) => {
  const input = readFile('tables/escaped-pipes')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  const table = page.tables()[0]?.json()
  t.equal(page.tables().length, 1, 'one table')
  t.deepEqual(table?.rows.map((row) => row.length), [2, 2, 2, 2], 'escaped pipes do not create extra columns')
  t.deepEqual(table?.rows[1], ['Text', 'left | right'], 'literal pipe decoded')
  t.deepEqual(page.links().map((item) => [item.json().target, item.json().alias]), [['Note', 'Label']], 'escaped wikilink alias separator')
  t.deepEqual(page.embeds().map((item) => [item.json().target, item.json().width]), [['image.png', 100]], 'escaped embed size separator')
  t.end()
})

test('tables/escaped-pipes - serialized and reparsed', (t) => {
  const input = readFile('tables/escaped-pipes')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  const table = page.tables()[0]?.json()
  t.equal(page.tables().length, 1, 'one table')
  t.deepEqual(table?.rows.map((row) => row.length), [2, 2, 2, 2], 'escaped pipes do not create extra columns')
  t.deepEqual(table?.rows[1], ['Text', 'left | right'], 'literal pipe decoded')
  t.deepEqual(page.links().map((item) => [item.json().target, item.json().alias]), [['Note', 'Label']], 'escaped wikilink alias separator')
  t.deepEqual(page.embeds().map((item) => [item.json().target, item.json().width]), [['image.png', 100]], 'escaped embed size separator')
  t.end()
})

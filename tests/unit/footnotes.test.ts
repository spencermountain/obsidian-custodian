import { nodes, values } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'

test('footnotes/simple-footnote', (t) => {
  const input = readFile('footnotes/simple-footnote')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.footnotes().map((item) => [item.json().identifier, item.text()]), [
    ['source', 'The source of the statement.']
  ], 'footnote definition and content')
  t.deepEqual(nodes(page, 'footnoteReference').map((node) => node.identifier), ['source'], 'matching reference')
  t.equal(page.links().length, 0, 'footnote reference is not an ordinary link')
  t.end()
})

test('footnotes/simple-footnote - serialized and reparsed', (t) => {
  const input = readFile('footnotes/simple-footnote')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.footnotes().map((item) => [item.json().identifier, item.text()]), [
    ['source', 'The source of the statement.']
  ], 'footnote definition and content')
  t.deepEqual(nodes(page, 'footnoteReference').map((node) => node.identifier), ['source'], 'matching reference')
  t.equal(page.links().length, 0, 'footnote reference is not an ordinary link')
  t.end()
})

test('footnotes/multiple-paragraphs', (t) => {
  const input = readFile('footnotes/multiple-paragraphs')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.footnotes().map((item) => item.json().identifier), ['detail', 'other'], 'two definitions')
  t.deepEqual(nodes(page, 'footnoteReference').map((node) => node.identifier), ['detail', 'detail', 'other'], 'repeated references retained')
  const definitions = nodes(page, 'footnoteDefinition')
  t.deepEqual(definitions[0]?.children.map((node) => node.type), ['paragraph', 'paragraph', 'list'], 'multi-paragraph definition with a list')
  t.equal(definitions[1]?.children[0]?.children[0]?.value, 'A different footnote.', 'second definition content')
  t.deepEqual(page.lists()[0]?.json().items.map((item) => item.text), ['A supporting point', 'Another supporting point'], 'footnote list content')
  t.equal(nodes(page, 'strong')[0]?.children[0]?.value, 'formatted text', 'footnote inline formatting')
  t.deepEqual(values(page, 'blockId'), [], 'footnotes are not Obsidian block IDs')
  t.end()
})

test('footnotes/multiple-paragraphs - serialized and reparsed', (t) => {
  const input = readFile('footnotes/multiple-paragraphs')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.footnotes().map((item) => item.json().identifier), ['detail', 'other'], 'two definitions')
  t.deepEqual(nodes(page, 'footnoteReference').map((node) => node.identifier), ['detail', 'detail', 'other'], 'repeated references retained')
  const definitions = nodes(page, 'footnoteDefinition')
  t.deepEqual(definitions[0]?.children.map((node) => node.type), ['paragraph', 'paragraph', 'list'], 'multi-paragraph definition with a list')
  t.equal(definitions[1]?.children[0]?.children[0]?.value, 'A different footnote.', 'second definition content')
  t.deepEqual(page.lists()[0]?.json().items.map((item) => item.text), ['A supporting point', 'Another supporting point'], 'footnote list content')
  t.equal(nodes(page, 'strong')[0]?.children[0]?.value, 'formatted text', 'footnote inline formatting')
  t.deepEqual(values(page, 'blockId'), [], 'footnotes are not Obsidian block IDs')
  t.end()
})

test('inline footnotes preserve inline formatting', (t) => {
  const page = parsePage('Text ^[A **bold** note with [[Link]] and [brackets].]')
  t.equal(page.footnotes().length, 1, 'inline footnote is addressable')
  t.equal(page.footnotes()[0]?.text(), 'A bold note with Link and [brackets].')
  t.equal(page.links().length, 1)
  page.append('')
  const reparsed = parsePage(page.markdown())
  t.equal(reparsed.footnotes().length, 1)
  t.equal(reparsed.footnotes()[0]?.text(), 'A bold note with Link and [brackets].')
  t.equal(parsePage('`^[literal]` \\^[escaped]').footnotes().length, 0)
  t.end()
})

test('inline footnotes keep bracket and code boundaries', (t) => {
  const page = parsePage('A ^[Use `]` and **bold**.] B ^[Second note.]')
  t.deepEqual(page.footnotes().map(item => item.text()), ['Use ] and bold.', 'Second note.'])
  page.append('')
  t.deepEqual(parsePage(page.markdown()).footnotes().map(item => item.text()), ['Use ] and bold.', 'Second note.'])
  t.equal(page.text({ footnotes: false }), 'A  B ')
  t.end()
})

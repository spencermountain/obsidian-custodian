import { nodes, values } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'

test('blocks/paragraph-block', (t) => {
  const input = readFile('blocks/paragraph-block')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  const block = page.paragraphs().find((item) => item.json().blockId === 'paragraph-id')
  t.equal(
    block?.text(),
    'A paragraph that can be linked to.',
    'block ID excluded from paragraph text'
  )
  t.deepEqual(values(page, 'blockId'), ['paragraph-id'], 'one block marker')
  t.deepEqual(
    page.links().map((item) => [item.json().target, item.json().block, item.json().alias]),
    [['', 'paragraph-id', 'Back to the paragraph']],
    'local block link'
  )
  t.end()
})

test('blocks/paragraph-block - serialized and reparsed', (t) => {
  const input = readFile('blocks/paragraph-block')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  const block = page.paragraphs().find((item) => item.json().blockId === 'paragraph-id')
  t.equal(
    block?.text(),
    'A paragraph that can be linked to.',
    'block ID excluded from paragraph text'
  )
  t.deepEqual(values(page, 'blockId'), ['paragraph-id'], 'one block marker')
  t.deepEqual(
    page.links().map((item) => [item.json().target, item.json().block, item.json().alias]),
    [['', 'paragraph-id', 'Back to the paragraph']],
    'local block link'
  )
  t.end()
})

test('blocks/quote-block', (t) => {
  const input = readFile('blocks/quote-block')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(nodes(page, 'blockquote')[0]?.blockId, 'quote-id', 'standalone ID labels preceding quote')
  t.equal(nodes(page, 'blockquote')[0]?.children.length, 2, 'both quoted paragraphs retained')
  t.equal(page.links()[0]?.json().block, 'quote-id', 'link to quotation')
  t.deepEqual(values(page, 'blockId'), ['quote-id'], 'one marker')
  t.end()
})

test('blocks/quote-block - serialized and reparsed', (t) => {
  const input = readFile('blocks/quote-block')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(nodes(page, 'blockquote')[0]?.blockId, 'quote-id', 'standalone ID labels preceding quote')
  t.equal(nodes(page, 'blockquote')[0]?.children.length, 2, 'both quoted paragraphs retained')
  t.equal(page.links()[0]?.json().block, 'quote-id', 'link to quotation')
  t.deepEqual(values(page, 'blockId'), ['quote-id'], 'one marker')
  t.end()
})

test('blocks/list-item-block', (t) => {
  const input = readFile('blocks/list-item-block')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  const block = page.paragraphs().find((item) => item.json().blockId === 'first-item')
  t.equal(block?.text(), 'The first item has an identifier.', 'addressable item content')
  t.equal(page.lists()[0]?.json().items.length, 2, 'two list items')
  t.deepEqual(values(page, 'blockId'), ['first-item'], 'one marker within list')
  t.equal(page.links()[0]?.json().block, 'first-item', 'link references first item')
  t.end()
})

test('blocks/list-item-block - serialized and reparsed', (t) => {
  const input = readFile('blocks/list-item-block')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  const block = page.paragraphs().find((item) => item.json().blockId === 'first-item')
  t.equal(block?.text(), 'The first item has an identifier.', 'addressable item content')
  t.equal(page.lists()[0]?.json().items.length, 2, 'two list items')
  t.deepEqual(values(page, 'blockId'), ['first-item'], 'one marker within list')
  t.equal(page.links()[0]?.json().block, 'first-item', 'link references first item')
  t.end()
})

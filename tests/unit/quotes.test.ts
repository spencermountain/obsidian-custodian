import { nodes } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'

test('quotes/simple-quote', (t) => {
  const input = readFile('quotes/simple-quote')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  const quotes = nodes(page, 'blockquote')
  t.equal(quotes.length, 1, 'one blockquote')
  t.deepEqual(quotes[0]?.children.map((node) => node.type), ['paragraph', 'paragraph'], 'two quoted paragraphs')
  t.deepEqual(page.links().map((item) => [item.json().target, item.json().alias]), [['Another note', 'a link']], 'link inside quote')
  t.equal(nodes(page, 'strong').length, 1, 'formatting inside quote')
  t.equal(page.ast().children[1]?.type, 'paragraph', 'final paragraph stays outside quote')
  t.equal(page.callouts().length, 0, 'ordinary quote is not a callout')
  t.end()
})

test('quotes/simple-quote - serialized and reparsed', (t) => {
  const input = readFile('quotes/simple-quote')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  const quotes = nodes(page, 'blockquote')
  t.equal(quotes.length, 1, 'one blockquote')
  t.deepEqual(quotes[0]?.children.map((node) => node.type), ['paragraph', 'paragraph'], 'two quoted paragraphs')
  t.deepEqual(page.links().map((item) => [item.json().target, item.json().alias]), [['Another note', 'a link']], 'link inside quote')
  t.equal(nodes(page, 'strong').length, 1, 'formatting inside quote')
  t.equal(page.ast().children[1]?.type, 'paragraph', 'final paragraph stays outside quote')
  t.equal(page.callouts().length, 0, 'ordinary quote is not a callout')
  t.end()
})

test('quotes/nested-quotes', (t) => {
  const input = readFile('quotes/nested-quotes')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  const quotes = nodes(page, 'blockquote')
  t.equal(quotes.length, 2, 'outer and inner quote')
  t.deepEqual(quotes[0]?.children.map((node) => node.type), ['paragraph', 'blockquote', 'paragraph'], 'outer quote resumes after inner quote')
  t.deepEqual(quotes[1]?.children.map((node) => node.type), ['paragraph', 'list'], 'list remains in inner quote')
  t.deepEqual(page.lists()[0]?.json().items.map((item) => item.text), ['First quoted item', 'Second quoted item'], 'nested list content')
  t.end()
})

test('quotes/nested-quotes - serialized and reparsed', (t) => {
  const input = readFile('quotes/nested-quotes')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  const quotes = nodes(page, 'blockquote')
  t.equal(quotes.length, 2, 'outer and inner quote')
  t.deepEqual(quotes[0]?.children.map((node) => node.type), ['paragraph', 'blockquote', 'paragraph'], 'outer quote resumes after inner quote')
  t.deepEqual(quotes[1]?.children.map((node) => node.type), ['paragraph', 'list'], 'list remains in inner quote')
  t.deepEqual(page.lists()[0]?.json().items.map((item) => item.text), ['First quoted item', 'Second quoted item'], 'nested list content')
  t.end()
})

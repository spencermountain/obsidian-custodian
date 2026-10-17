import { nodes } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'

test('callouts/simple-callout', (t) => {
  const input = readFile('callouts/simple-callout')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(
    page.callouts().map((item) => {
      const { calloutType, title, fold } = item.json()
      return { calloutType, title, fold }
    }),
    [
      { calloutType: 'note', title: '', fold: null },
      { calloutType: 'tip', title: 'A custom title', fold: null }
    ],
    'default and explicit titles'
  )
  t.equal(nodes(page, 'strong').length, 1, 'formatting in custom title')
  t.deepEqual(
    page.links().map((item) => [item.json().target, item.text()]),
    [['Note', 'a link']],
    'body wikilink'
  )
  t.equal(
    nodes(page, 'callout')[0]?.children[0]?.children[0]?.value,
    'A callout with its default title.',
    'default-title callout body'
  )
  t.end()
})

test('callouts/simple-callout - serialized and reparsed', (t) => {
  const input = readFile('callouts/simple-callout')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(
    page.callouts().map((item) => {
      const { calloutType, title, fold } = item.json()
      return { calloutType, title, fold }
    }),
    [
      { calloutType: 'note', title: '', fold: null },
      { calloutType: 'tip', title: 'A custom title', fold: null }
    ],
    'default and explicit titles'
  )
  t.equal(nodes(page, 'strong').length, 1, 'formatting in custom title')
  t.deepEqual(
    page.links().map((item) => [item.json().target, item.text()]),
    [['Note', 'a link']],
    'body wikilink'
  )
  t.equal(
    nodes(page, 'callout')[0]?.children[0]?.children[0]?.value,
    'A callout with its default title.',
    'default-title callout body'
  )
  t.end()
})

test('callouts/foldable-callouts', (t) => {
  const input = readFile('callouts/foldable-callouts')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(
    page.callouts().map((item) => {
      const { calloutType, title, fold } = item.json()
      return [calloutType, title, fold]
    }),
    [
      ['faq', 'Initially collapsed', 'collapsed'],
      ['example', 'Initially expanded', 'expanded']
    ],
    'fold markers and titles'
  )
  t.deepEqual(
    nodes(page, 'callout').map((node) => node.children[0]?.children[0]?.value),
    ['The answer is hidden until expanded.', 'The example is visible immediately.'],
    'fold state does not remove content'
  )
  t.end()
})

test('callouts/foldable-callouts - serialized and reparsed', (t) => {
  const input = readFile('callouts/foldable-callouts')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(
    page.callouts().map((item) => {
      const { calloutType, title, fold } = item.json()
      return [calloutType, title, fold]
    }),
    [
      ['faq', 'Initially collapsed', 'collapsed'],
      ['example', 'Initially expanded', 'expanded']
    ],
    'fold markers and titles'
  )
  t.deepEqual(
    nodes(page, 'callout').map((node) => node.children[0]?.children[0]?.value),
    ['The answer is hidden until expanded.', 'The example is visible immediately.'],
    'fold state does not remove content'
  )
  t.end()
})

test('callouts/nested-callouts', (t) => {
  const input = readFile('callouts/nested-callouts')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(
    page.callouts().map((item) => [item.json().calloutType, item.json().title]),
    [
      ['question', 'Outer question'],
      ['tip', 'Inner tip']
    ],
    'nested callout types and titles'
  )
  t.deepEqual(
    nodes(page, 'callout')[0]?.children.map((node) => node.type),
    ['paragraph', 'callout', 'paragraph'],
    'nested callout remains inside outer body'
  )
  t.equal(
    nodes(page, 'callout')[0]?.children[2]?.children[0]?.value,
    'The outer callout continues.',
    'outer body resumes'
  )
  t.equal(nodes(page, 'strong')[0]?.children[0]?.value, 'emphasis', 'nested body formatting')
  t.end()
})

test('callouts/nested-callouts - serialized and reparsed', (t) => {
  const input = readFile('callouts/nested-callouts')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(
    page.callouts().map((item) => [item.json().calloutType, item.json().title]),
    [
      ['question', 'Outer question'],
      ['tip', 'Inner tip']
    ],
    'nested callout types and titles'
  )
  t.deepEqual(
    nodes(page, 'callout')[0]?.children.map((node) => node.type),
    ['paragraph', 'callout', 'paragraph'],
    'nested callout remains inside outer body'
  )
  t.equal(
    nodes(page, 'callout')[0]?.children[2]?.children[0]?.value,
    'The outer callout continues.',
    'outer body resumes'
  )
  t.equal(nodes(page, 'strong')[0]?.children[0]?.value, 'emphasis', 'nested body formatting')
  t.end()
})

test('callouts/title-only', (t) => {
  const input = readFile('callouts/title-only')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(
    page.callouts().map((item) => {
      const { calloutType, title, fold } = item.json()
      return [calloutType, title, fold]
    }),
    [
      ['warning', 'A title without a body', null],
      ['custom-type', 'A custom callout type', 'expanded']
    ],
    'title-only and custom callouts'
  )
  t.deepEqual(
    nodes(page, 'callout').map((node) => node.children.length),
    [0, 0],
    'no invented body paragraphs'
  )
  t.end()
})

test('callouts/title-only - serialized and reparsed', (t) => {
  const input = readFile('callouts/title-only')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(
    page.callouts().map((item) => {
      const { calloutType, title, fold } = item.json()
      return [calloutType, title, fold]
    }),
    [
      ['warning', 'A title without a body', null],
      ['custom-type', 'A custom callout type', 'expanded']
    ],
    'title-only and custom callouts'
  )
  t.deepEqual(
    nodes(page, 'callout').map((node) => node.children.length),
    [0, 0],
    'no invented body paragraphs'
  )
  t.end()
})

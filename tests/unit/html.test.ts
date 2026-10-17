import { nodes, values } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'

test('html/block-html', (t) => {
  const input = readFile('html/block-html')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(values(page, 'html'), [
    '<div class="example">\n**This stays literal inside HTML.**\n[[This is not a Markdown link.]]\n</div>'
  ], 'raw HTML retains its Markdown-looking contents')
  t.equal(page.links().length, 0, 'HTML wikilink stays literal')
  t.deepEqual(nodes(page, 'strong').map((node) => node.children[0]?.value), ['This paragraph uses Markdown.'], 'only outside emphasis parsed')
  t.end()
})

test('html/block-html - serialized and reparsed', (t) => {
  const input = readFile('html/block-html')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(values(page, 'html'), [
    '<div class="example">\n**This stays literal inside HTML.**\n[[This is not a Markdown link.]]\n</div>'
  ], 'raw HTML retains its Markdown-looking contents')
  t.equal(page.links().length, 0, 'HTML wikilink stays literal')
  t.deepEqual(nodes(page, 'strong').map((node) => node.children[0]?.value), ['This paragraph uses Markdown.'], 'only outside emphasis parsed')
  t.end()
})

test('html/inline-html', (t) => {
  const input = readFile('html/inline-html')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(values(page, 'html'), ['<span class="example">**literal emphasis** and [[literal link]]</span>'], 'inline element is one literal HTML node')
  t.deepEqual(page.links().map((item) => item.json().target), ['Note'], 'only outside wikilink parsed')
  t.deepEqual(nodes(page, 'strong').map((node) => node.children[0]?.value), ['emphasis'], 'only outside emphasis parsed')
  const first = page.paragraphs()[0]?.ast()
  t.equal(first?.children[0]?.value, 'Before ', 'text before HTML')
  t.equal(first?.children.at(-1)?.value, ' after.', 'text after HTML')
  t.end()
})

test('html/inline-html - serialized and reparsed', (t) => {
  const input = readFile('html/inline-html')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(values(page, 'html'), ['<span class="example">**literal emphasis** and [[literal link]]</span>'], 'inline element is one literal HTML node')
  t.deepEqual(page.links().map((item) => item.json().target), ['Note'], 'only outside wikilink parsed')
  t.deepEqual(nodes(page, 'strong').map((node) => node.children[0]?.value), ['emphasis'], 'only outside emphasis parsed')
  const first = page.paragraphs()[0]?.ast()
  t.equal(first?.children[0]?.value, 'Before ', 'text before HTML')
  t.equal(first?.children.at(-1)?.value, ' after.', 'text after HTML')
  t.end()
})

test('self-closing nested HTML does not expose Markdown', (t) => {
  const input = '<span>before<span />**literal** [[Hidden]]</span>'
  const page = parsePage(input)
  t.equal(page.links().length, 0)
  t.equal(page.text({ html: true }), input)
  page.append('')
  t.equal(parsePage(page.markdown()).links().length, 0)
  t.end()
})

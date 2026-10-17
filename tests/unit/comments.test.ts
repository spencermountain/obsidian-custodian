import { nodes } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'

test('comments/inline-comment', (t) => {
  const input = readFile('comments/inline-comment')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(
    page.comments().map((item) => item.json().value),
    ['a hidden comment', '[[Not a link]] and ==not a highlight=='],
    'comments preserve literal contents'
  )
  t.equal(page.links().length, 0, 'no links parsed inside comments')
  t.equal(page.highlights().length, 0, 'no highlights parsed inside comments')
  t.deepEqual(
    page.paragraphs().map((item) => item.text()),
    ['Visible text  continues here.', 'Before  after.'],
    'visible text excludes comments without normalizing spaces'
  )
  t.end()
})

test('comments/inline-comment - serialized and reparsed', (t) => {
  const input = readFile('comments/inline-comment')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(
    page.comments().map((item) => item.json().value),
    ['a hidden comment', '[[Not a link]] and ==not a highlight=='],
    'comments preserve literal contents'
  )
  t.equal(page.links().length, 0, 'no links parsed inside comments')
  t.equal(page.highlights().length, 0, 'no highlights parsed inside comments')
  t.deepEqual(
    page.paragraphs().map((item) => item.text()),
    ['Visible text  continues here.', 'Before  after.'],
    'visible text excludes comments without normalizing spaces'
  )
  t.end()
})

test('comments/block-comment', (t) => {
  const input = readFile('comments/block-comment')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(
    page.comments().map((item) => item.json().value),
    ['\n# A hidden heading\n\n- A hidden list\n- [[A hidden link]]\n\n**Hidden formatting**\n'],
    'comment spans blank lines and retains literal Markdown'
  )
  t.equal(page.headings().length, 0, 'hidden heading not parsed')
  t.equal(page.lists().length, 0, 'hidden list not parsed')
  t.equal(page.links().length, 0, 'hidden link not parsed')
  t.equal(nodes(page, 'strong').length, 0, 'hidden emphasis not parsed')
  t.deepEqual(
    page.paragraphs().map((item) => item.text()),
    ['Before the comment.', 'After the comment.'],
    'surrounding content retained'
  )
  t.end()
})

test('comments/block-comment - serialized and reparsed', (t) => {
  const input = readFile('comments/block-comment')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(
    page.comments().map((item) => item.json().value),
    ['\n# A hidden heading\n\n- A hidden list\n- [[A hidden link]]\n\n**Hidden formatting**\n'],
    'comment spans blank lines and retains literal Markdown'
  )
  t.equal(page.headings().length, 0, 'hidden heading not parsed')
  t.equal(page.lists().length, 0, 'hidden list not parsed')
  t.equal(page.links().length, 0, 'hidden link not parsed')
  t.equal(nodes(page, 'strong').length, 0, 'hidden emphasis not parsed')
  t.deepEqual(
    page.paragraphs().map((item) => item.text()),
    ['Before the comment.', 'After the comment.'],
    'surrounding content retained'
  )
  t.end()
})

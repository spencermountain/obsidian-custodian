import test from 'tape'
import parsePage from '../lib.ts'

const cases = [
  { name: 'wikilink', input: '[[Original]]', target: 'Original', next: 'Replacement' },
  {
    name: 'aliased wikilink',
    input: '[[Original|Label]]',
    target: 'Original',
    next: 'Replacement'
  },
  {
    name: 'heading wikilink',
    input: '[[Original#Details|Label]]',
    target: 'Original',
    next: 'Replacement'
  },
  {
    name: 'block wikilink',
    input: '[[Original#^block-id|Label]]',
    target: 'Original',
    next: 'Replacement'
  },
  {
    name: 'Markdown link',
    input: '[Label](https://example.com "Tooltip")',
    target: 'https://example.com',
    next: 'https://example.org/new'
  },
  {
    name: 'full reference',
    input: '[Label][ref]\n\n[ref]: https://example.com "Tooltip"',
    target: 'https://example.com',
    next: 'https://example.org/new'
  },
  {
    name: 'collapsed reference',
    input: '[ref][]\n\n[ref]: https://example.com',
    target: 'https://example.com',
    next: 'https://example.org/new'
  },
  {
    name: 'shortcut reference',
    input: '[ref]\n\n[ref]: https://example.com',
    target: 'https://example.com',
    next: 'https://example.org/new'
  }
]

cases.forEach(({ name, input, target, next }) => {
  test(`${name}: title and target properties`, (t) => {
    const page = parsePage(input)
    const link = page.links()[0]
    t.equal(link.target, target, 'reads destination')
    t.equal(link.title, link.text(), 'reads display text')
    link.title = 'New label'
    t.equal(link.title, 'New label', 'sets display text')
    t.equal(link.target, target, 'label edit preserves destination')
    link.target = next
    t.equal(link.target, next, 'sets destination')
    t.equal(link.title, 'New label', 'destination edit preserves label')
    const roundtrip = parsePage(page.markdown()).links()[0]
    t.equal(roundtrip.title, 'New label', 'label survives serialization')
    t.equal(roundtrip.target, next, 'destination survives serialization')
    t.end()
  })
})

test('link setters reject invalid values without changing the page', (t) => {
  const page = parsePage('[[Original|Label]]')
  const link = page.links()[0]
  const before = page.markdown()
  t.throws(
    () => {
      link.target = 'bad|target'
    },
    /Invalid/,
    'rejects escaping a wikilink'
  )
  t.throws(
    () => {
      link.title = 123 as any
    },
    TypeError,
    'rejects non-string labels'
  )
  t.throws(
    () => {
      link.target = 123 as any
    },
    TypeError,
    'rejects non-string targets'
  )
  t.equal(page.markdown(), before, 'failed edits are atomic')
  t.end()
})

test('reference destination edits affect only the selected link', (t) => {
  const page = parsePage('[First][ref] and [Second][ref]\n\n[ref]: https://example.com "Tooltip"')
  page.links()[0].target = 'https://example.org'
  const links = parsePage(page.markdown()).links()
  t.equal(links[0].target, 'https://example.org', 'changes selected destination')
  t.equal(links[1].target, 'https://example.com', 'preserves other references')
  t.equal(links[0].title, 'First', 'preserves selected label')
  t.equal(links[0].json().title, 'Tooltip', 'preserves tooltip metadata')
  t.end()
})

import { nodes } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'
const here = '[links] '

test('misc-link', (t) => {
  const md = `hello [[world]]`
  const page = parsePage(md)

  t.equal(page.links().length, 1, `${here} link-len`)
  t.equal(page.headings().length, 0, `${here} zero-headings`)

  const json = page.json()
  t.equal(json.links.length, 1, `${here} json-link-len`)

  t.equal(page.markdown(), md, `${here} output-same`)

  t.end()
})

test('links/markdown-link', (t) => {
  const md = readFile('links/markdown-link')
  const page = parsePage(md)
  t.equal(page.links().length, 2, `${here} two-links`)
  const json = page.json()
  t.equal(json.links?.[0].text, 'Three laws of motion', `${here} link-text-1`)
  t.equal(json.links?.[1].text, 'More laws of motion', `${here} link-text-2`)

  t.end()
})

test('links/wiki-alias', (t) => {
  const input = readFile('links/wiki-alias')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.links().map((item) => {
    const { target, alias, text } = item.json()
    return { target, alias, text }
  }), [
    { target: 'Three laws of motion', alias: "Newton's laws", text: "Newton's laws" },
    { target: 'Physics/Motion', alias: 'the motion note', text: 'the motion note' }
  ], 'destinations and displayed aliases')
  t.equal(page.embeds().length, 0, 'links are not embeds')
  t.end()
})

test('links/wiki-alias - serialized and reparsed', (t) => {
  const input = readFile('links/wiki-alias')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.links().map((item) => {
    const { target, alias, text } = item.json()
    return { target, alias, text }
  }), [
    { target: 'Three laws of motion', alias: "Newton's laws", text: "Newton's laws" },
    { target: 'Physics/Motion', alias: 'the motion note', text: 'the motion note' }
  ], 'destinations and displayed aliases')
  t.equal(page.embeds().length, 0, 'links are not embeds')
  t.end()
})

test('links/wiki-fragments', (t) => {
  const input = readFile('links/wiki-fragments')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.links().map((item) => {
    const { target, heading, block, alias } = item.json()
    return { target, heading, block, alias }
  }), [
    { target: '', heading: 'Local heading', block: null, alias: null },
    { target: 'Physics/Motion', heading: 'Velocity#Examples', block: null, alias: 'Nested heading' },
    { target: 'Daily note', heading: null, block: 'summary', alias: 'Summary block' },
    { target: '', heading: null, block: 'local-block', alias: null }
  ], 'local, nested-heading, and block fragments')
  t.end()
})

test('links/wiki-fragments - serialized and reparsed', (t) => {
  const input = readFile('links/wiki-fragments')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.links().map((item) => {
    const { target, heading, block, alias } = item.json()
    return { target, heading, block, alias }
  }), [
    { target: '', heading: 'Local heading', block: null, alias: null },
    { target: 'Physics/Motion', heading: 'Velocity#Examples', block: null, alias: 'Nested heading' },
    { target: 'Daily note', heading: null, block: 'summary', alias: 'Summary block' },
    { target: '', heading: null, block: 'local-block', alias: null }
  ], 'local, nested-heading, and block fragments')
  t.end()
})

test('links/external-and-titled', (t) => {
  const input = readFile('links/external-and-titled')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.links().map((item) => item.json().url), [
    'https://example.com', 'Notes/A note.md', 'mailto:hello@example.com'
  ], 'URL, angle-bracket path, and email destination')
  t.deepEqual(page.links().map((item) => item.text()), ['Example', 'a note with spaces', 'an email'], 'link labels')
  t.deepEqual(nodes(page, 'link').map((node) => node.title), ['An example website', null, null], 'optional link title')
  t.end()
})

test('links/external-and-titled - serialized and reparsed', (t) => {
  const input = readFile('links/external-and-titled')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.links().map((item) => item.json().url), [
    'https://example.com', 'Notes/A note.md', 'mailto:hello@example.com'
  ], 'URL, angle-bracket path, and email destination')
  t.deepEqual(page.links().map((item) => item.text()), ['Example', 'a note with spaces', 'an email'], 'link labels')
  t.deepEqual(nodes(page, 'link').map((node) => node.title), ['An example website', null, null], 'optional link title')
  t.end()
})

test('links/reference-links', (t) => {
  const input = readFile('links/reference-links')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.links().map((item) => item.text()), ['the guide', 'details', 'reference'], 'reference labels')
  t.deepEqual(nodes(page, 'linkReference').map((node) => [node.identifier, node.referenceType]), [
    ['guide', 'full'], ['details', 'collapsed'], ['reference', 'shortcut']
  ], 'three reference-link forms')
  t.deepEqual(nodes(page, 'definition').map((node) => [node.identifier, node.url, node.title]), [
    ['guide', 'https://example.com/guide', 'The guide'],
    ['details', 'https://example.com/details', null],
    ['reference', 'https://example.com/reference', null]
  ], 'reference destinations and title')
  t.end()
})

test('links/reference-links - serialized and reparsed', (t) => {
  const input = readFile('links/reference-links')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.links().map((item) => item.text()), ['the guide', 'details', 'reference'], 'reference labels')
  t.deepEqual(nodes(page, 'linkReference').map((node) => [node.identifier, node.referenceType]), [
    ['guide', 'full'], ['details', 'collapsed'], ['reference', 'shortcut']
  ], 'three reference-link forms')
  t.deepEqual(nodes(page, 'definition').map((node) => [node.identifier, node.url, node.title]), [
    ['guide', 'https://example.com/guide', 'The guide'],
    ['details', 'https://example.com/details', null],
    ['reference', 'https://example.com/reference', null]
  ], 'reference destinations and title')
  t.end()
})

test('links/autolinks', (t) => {
  const input = readFile('links/autolinks')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.links().map((item) => item.json().url), [
    'https://example.com/path?query=value', 'mailto:hello@example.com',
    'https://example.com', 'http://www.example.com', 'mailto:hello@example.com'
  ], 'angle-bracket and GFM autolinks')
  t.equal(page.links()[4]?.text(), 'hello@example.com', 'sentence punctuation excluded from email')
  t.end()
})

test('links/autolinks - serialized and reparsed', (t) => {
  const input = readFile('links/autolinks')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.links().map((item) => item.json().url), [
    'https://example.com/path?query=value', 'mailto:hello@example.com',
    'https://example.com', 'http://www.example.com', 'mailto:hello@example.com'
  ], 'angle-bracket and GFM autolinks')
  t.equal(page.links()[4]?.text(), 'hello@example.com', 'sentence punctuation excluded from email')
  t.end()
})

const examples = [
  ['wiki-link', { target: 'Three laws of motion', text: 'Three laws of motion', heading: null }],
  ['link-anchor', { target: 'About Obsidian', heading: 'Links are first-class citizens' }]
]

examples.forEach(([name, expected]) => {
  test(`links/${name}`, (t) => {
    const md = readFile(`links/${name}`)
    const page = parsePage(md)
    const links = page.links().map((link) => link.json())

    t.equal(links.length, 1, `${here} ${name} one-link`)
    t.equal(links[0]?.type, 'wikiLink', `${here} ${name} wiki-type`)
    t.equal(links[0]?.alias, null, `${here} ${name} no-alias`)
    t.equal(links[0]?.block, null, `${here} ${name} no-block`)
    Object.entries(expected).forEach(([key, value]) => {
      t.equal(links[0]?.[key], value, `${here} ${name} ${key}`)
    })
    t.equal(page.embeds().length, 0, `${here} ${name} not-an-embed`)
    t.deepEqual(page.json().links, links, `${here} ${name} json-links`)
    t.equal(page.markdown(), md, `${here} ${name} output-same`)
    t.end()
  })
})

test('wikilink text includes heading fragments', (t) => {
  const page = parsePage('[[#Section]] [[Note#Section]] [[Note#Section|Alias]]')
  t.deepEqual(page.links().map(item => item.text()), ['Section', 'Note#Section', 'Alias'])
  t.deepEqual(page.json().links.map(item => item.text), ['Section', 'Note#Section', 'Alias'])
  t.end()
})

test('reference links expose their definitions in JSON', (t) => {
  const page = parsePage('[Label][id]\n\n[id]: https://example.com "Title"')
  t.equal(page.links()[0]?.json().url, 'https://example.com')
  t.equal(page.links()[0]?.json().title, 'Title')
  t.equal(page.json().links[0]?.url, 'https://example.com')
  page.append('')
  t.equal(parsePage(page.markdown()).links()[0]?.json().url, 'https://example.com')
  t.end()
})

test('reference resolution follows current definitions', (t) => {
  const page = parsePage('[Label][ID]\n\n[id]: https://first.example\n\n[id]: https://second.example')
  t.equal(page.links()[0]?.json().url, 'https://first.example', 'first definition wins')
  page.blocks().find(item => item.ast().type === 'definition').remove()
  t.equal(page.links()[0]?.json().url, 'https://second.example', 'removing a definition updates resolution')
  t.equal(page.json().links[0]?.url, 'https://second.example')
  t.end()
})

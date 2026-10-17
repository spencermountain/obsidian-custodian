import test from 'tape'
import parsePage from '../lib.ts'

test('selectors return specialized sections with common methods', (t) => {
  const page = parsePage(
    'Paragraph [[Note|alias]] ![[photo.png]]\n\n> [!tip] Title\n> Body [[Other]]'
  )
  const link = page.links()[0]
  const callout = page.callouts()[0]
  t.equal(typeof link.target, 'string')
  t.equal(typeof callout.body, 'function')
  t.notEqual(page.embeds()[0].constructor, link.constructor)
  t.notEqual(page.paragraphs()[0].constructor, link.constructor)
  t.notOk('blocks' in page, 'generic blocks selector is not exposed')
  t.equal(link.target, 'Note')
  t.equal(callout.title, 'Title')
  t.equal(callout.body(), 'Body Other')
  t.equal(link.text(), 'alias')
  t.equal(page.paragraphs()[0].text(), 'Paragraph alias ')
  t.equal(page.json().callouts[0].text, callout.text(true))
  t.equal(page.text({ embeds: true, callouts: true }), 'Paragraph alias photo.png\nTitle\nBody Other')
  t.end()
})

test('sections keep shared filtering and detached output', (t) => {
  const page = parsePage('> [!note] [[Title]]\n> Body [[Target]]')
  const section = page.callouts()[0]
  t.equal(section.text('body'), 'Body Target')
  t.equal(page.text({ links: false, callouts: true }), '\nBody ')
  t.equal(section.json(false), null)
  t.equal(section.ast(false), null)
  t.equal(section.text(false), '')
  section.ast().children.length = 0
  t.equal(section.body(), 'Body Target')
  t.equal(
    page.json({ callouts: true }).callouts[0].text,
    section.text(true)
  )
  t.end()
})

test('section edits remain atomic and stale handles reject changes', (t) => {
  const page = parsePage('[[Old]]\n\n> [!tip] Title\n> Body')
  const first = page.links()[0]
  const second = page.links()[0]
  t.equal(first.update({ target: 'New' }), first)
  t.equal(second.target, 'New')
  t.ok(page.markdown().includes('[[New]]'))
  t.throws(() => first.update({ target: 'Invalid|target' }))
  t.equal(first.target, 'New')
  const callout = page.callouts()[0]
  callout.update({ title: 'Changed' })
  t.equal(callout.title, 'Changed')
  t.equal(first.remove(), page)
  t.throws(() => second.update({ target: 'Detached' }), /removed|detached/)
  t.throws(() => second.remove(), /removed|detached/)
  t.end()
})

test('generic sections render nested specialized nodes and unknown types', (t) => {
  const Page = parsePage('').constructor as any
  const page = new Page({
    type: 'root',
    children: [
      {
        type: 'constructor',
        children: [
          { type: 'wikiLink', target: 'Note', heading: 'Section', block: null, alias: null }
        ]
      }
    ]
  })
  t.equal(page.text(), 'Note#Section')
  t.equal(page.text({ links: false }), '')
  t.end()
})

test('reference links and callout title links retain section behavior', (t) => {
  const page = parsePage('[Label][id]\n\n[id]: https://example.com\n\n> [!note] [[Title]]\n> Body')
  t.equal(page.links()[0].target, 'https://example.com')
  const titleLink = page.links()[1]
  t.equal(titleLink.target, 'Title')
  titleLink.remove()
  t.equal(page.callouts()[0].title, '')
  t.equal(page.callouts()[0].body(), 'Body')
  t.throws(() => titleLink.update({ target: 'Detached' }), /removed|detached/)
  t.end()
})

import test from 'tape'
import parsePage from '../lib.ts'

test('sections accept scalar output options', (t) => {
  const page = parsePage('## Heading\n\n> [!note] Title\n> Body\n\n![[photo.png]]')
  const heading = page.headings()[0]
  t.equal(heading.text(), '## Heading')
  t.equal(heading.text('inline'), 'Heading')
  t.equal(heading.text(false), '')
  t.equal(heading.json(false), null)
  t.equal(heading.json(true).text, 'Heading')
  t.equal(heading.ast(false), null)
  t.equal(heading.ast(true).type, 'heading')
  t.equal(heading.html('inline'), 'Heading')
  t.equal(heading.html(false), '')
  t.equal(heading.markdown('inline'), 'Heading\n')
  t.equal(heading.markdown(false), '')
  const callout = page.callouts()[0]
  t.equal(callout.text('body'), 'Body')
  t.equal(callout.text(true), 'Title\nBody')
  t.equal(callout.body(false), '')
  t.notOk(callout.html('body').includes('Title'))
  t.equal(page.embeds()[0].text(), '')
  t.equal(page.embeds()[0].text(true), 'photo.png')
  t.end()
})

test('page options still filter nested section output', (t) => {
  const page = parsePage('> [!note] [[Title]]\n> Body [[Link]] ![[photo.png]]')
  t.equal(page.text({ callouts: true, links: false, embeds: false }), '\nBody  ')
  t.equal(page.json({ links: false, embeds: false }).callouts[0].text, '\nBody  ')
  t.notOk(page.html({ links: false, embeds: false }).includes('href='))
  t.notOk(page.markdown({ links: false, embeds: false }).includes('[['))
  t.equal(page.links().length, 2, 'outputs leave the live tree unchanged')
  t.end()
})

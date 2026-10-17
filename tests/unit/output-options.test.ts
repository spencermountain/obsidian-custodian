import test from 'tape'
import parsePage from '../lib.ts'

test('heading modes apply to page and section text without mutating the document', (t) => {
  const source = '## Foo\n\nBody'
  const page = parsePage(source)
  t.equal(page.text(), '## Foo\nBody', 'text defaults to heading markers')
  t.equal(page.text({ headings: true }), '## Foo\nBody', 'true keeps heading markers')
  t.equal(page.text({ headings: false }), 'Body', 'false excludes headings')
  t.equal(page.text({ headings: 'inline' }), 'Foo\nBody', 'inline keeps only heading text')
  t.equal(page.headings()[0].text({ headings: true }), '## Foo', 'section uses the same mode')
  t.equal(page.headings()[0].text({ headings: false }), '', 'section can be omitted')
  t.equal(page.headings()[0].text({ headings: 'inline' }), 'Foo', 'section can be inline')
  t.equal(page.markdown(), source, 'text choices do not edit the document')
  t.end()
})

test('Markdown heading modes apply even before the first edit', (t) => {
  const page = parsePage('## Foo\n\nBody')
  t.equal(page.markdown({ headings: true }), '## Foo\n\nBody')
  t.equal(page.markdown({ headings: false }), 'Body\n')
  t.equal(page.markdown({ headings: 'inline' }), 'Foo\n\nBody\n')
  t.equal(page.ast().children[0].type, 'heading', 'inline output does not change the tree')
  t.equal(page.json().headings[0].text, 'Foo', 'JSON keeps plain heading text')
  t.deepEqual(page.json({ headings: false }).headings, [])
  t.equal(page.ast({ headings: false }).children.length, 1)
  t.end()
})

test('output categories include embeds, tags, HTML, quotes, and rules', (t) => {
  const page = parsePage('![[image.png]] #tag\n\n<div>HTML</div>\n\n> Quote\n\n---')
  const options = { embeds: false, tags: false, html: false, quotes: false, thematicBreaks: false }
  t.equal(page.text(options).trim(), '', 'categories can be excluded together')
  t.deepEqual(page.json(options).embeds, [], 'embeds uses the plural collection key')
  t.deepEqual(page.json(options).tags, [])
  t.equal(page.embeds().length, 1, 'filtering does not remove live sections')
  t.end()
})

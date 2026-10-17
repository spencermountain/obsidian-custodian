import test from 'tape'
import parsePage from '../lib.ts'

// Expected strings describe the output contract, without whitespace normalization.
test('text extracts formatting, aliases, callout titles, and bodies', (t) => {
  const page = parsePage('# **Heading**\n\nHello [[Note|friend]] and `code`.\n\n> [!note] A title\n> A body')
  t.equal(page.text({ headings: 'inline', callouts: true }), 'Heading\nHello friend and code.\nA title\nA body')
  t.equal(page.headings()[0].text({ headings: 'inline' }), 'Heading')
  t.equal(page.callouts()[0].text({ callouts: true }), 'A title\nA body')
  t.equal(page.callouts()[0].text({ callouts: 'body' }), 'A body')
  t.equal(page.text({ callouts: false, headings: 'inline' }), 'Heading\nHello friend and code.')
  t.equal(page.json().text, page.text({ headings: 'inline', callouts: true }))
  t.end()
})

test('output filters exclude nested content without changing the page', (t) => {
  const input = '> [!note] [[Title]]\n> [[Inside]]\n>\n> > [!tip] Nested\n> > Secret\n\n[[Outside]]'
  const page = parsePage(input)
  const json = page.json({ callouts: false })
  t.equal(page.text({ callouts: false }), 'Outside')
  t.equal(json.callouts.length, 0)
  t.deepEqual(json.links.map((link) => link.target), ['Outside'])
  t.equal(page.ast({ callouts: false }).children.length, 1)
  t.equal(page.markdown({ callouts: false }), '[[Outside]]\n')
  t.equal(page.callouts().length, 2)
  t.equal(page.links().length, 3)
  t.equal(page.markdown(), input)
  t.end()
})

test('callout body mode is for text and Markdown; structural outputs use booleans', (t) => {
  const page = parsePage('> [!note] [[Title]]\n> [[Body]]')
  const options = { callouts: 'body' as const }
  t.equal(page.text(options), 'Body')
  t.equal(page.markdown(options), '> [!note]\n> [[Body]]\n')
  t.equal(page.callouts()[0].text(options), 'Body')
  t.equal(page.json({ callouts: true }).callouts[0].title, 'Title')
  t.deepEqual(page.json({ callouts: false }).callouts, [])
  t.deepEqual(page.ast({ callouts: false }).children, [])
  t.equal(page.callouts()[0].json({ callouts: false }), null)
  t.equal(page.callouts()[0].ast({ callouts: false }), null)
  t.end()
})

test('text preserves whitespace and makes normally hidden content optional', (t) => {
  const page = parsePage('left  %%hidden%% right ^block-id')
  t.equal(page.text(), 'left   right')
  t.equal(page.text({ comments: true }), 'left  hidden right')
  t.equal(page.text({ blockIds: true }), 'left   rightblock-id')
  t.equal(page.comments()[0].text(), '')
  t.equal(page.comments()[0].text({ comments: true }), 'hidden')
  t.equal(page.json({ comments: false }).comments.length, 0)
  t.equal(page.ast({ blockIds: false }).children[0].blockId, undefined)
  t.notOk(page.markdown({ blockIds: false }).includes('^block-id'))
  t.end()
})

test('all content can be excluded and selected items can be omitted', (t) => {
  const page = parsePage('> [!note] Only\n> A body')
  const options = { callouts: false }
  const item = page.callouts()[0]
  t.equal(page.text(options), '')
  t.equal(page.markdown(options), '')
  t.deepEqual(page.ast(options).children, [])
  t.equal(item.text(options), '')
  t.equal(item.json(options), null)
  t.equal(item.ast(options), null)
  item.update({ title: 'Still editable' })
  t.equal(item.text({ callouts: true }), 'Still editable\nA body')
  t.end()
})

test('tables and literal sections have predictable text and inclusion flags', (t) => {
  const page = parsePage('---\ntitle: Example\n---\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```js\nlet x = 1\n```')
  t.equal(page.text({ frontmatter: true, tables: true }), 'title: Example\nA\tB\n1\t2\nlet x = 1')
  t.equal(page.text({ frontmatter: false, code: false, tables: true }), 'A\tB\n1\t2')
  t.equal(page.text({ frontmatter: false, code: false, tables: false }), '')
  const snapshot = page.ast({ code: false })
  snapshot.children.length = 0
  t.equal(page.tables().length, 1)
  t.equal(page.code().length, 1)
  t.end()
})

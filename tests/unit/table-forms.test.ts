import { fixture, nodes, values } from '../fixture.ts'

fixture('tables/inline-formatting', (t, page) => {
  t.equal(page.tables().length, 1, 'one table')
  t.deepEqual(page.tables()[0]?.json().rows, [
    ['Feature', 'Example'], ['Emphasis', 'Bold and italic'], ['Deletion', 'Old text'],
    ['Code', 'const x = 1'], ['Link', 'Example'], ['Highlight', 'Important']
  ], 'cell contents with inline formatting removed')
  t.deepEqual(page.tables()[0]?.json().align, [null, null], 'default alignment')
  t.equal(nodes(page, 'strong').length, 1, 'bold cell span')
  t.equal(nodes(page, 'emphasis').length, 1, 'italic cell span')
  t.equal(nodes(page, 'delete').length, 1, 'strikethrough cell span')
  t.deepEqual(values(page, 'inlineCode'), ['const x = 1'], 'inline code cell')
  t.deepEqual(page.links().map((item) => item.json().url), ['https://example.com'], 'link cell')
  t.deepEqual(page.highlights().map((item) => item.text()), ['Important'], 'highlight cell')
})

fixture('tables/escaped-pipes', (t, page) => {
  const table = page.tables()[0]?.json()
  t.equal(page.tables().length, 1, 'one table')
  t.deepEqual(table?.rows.map((row) => row.length), [2, 2, 2, 2], 'escaped pipes do not create extra columns')
  t.deepEqual(table?.rows[1], ['Text', 'left | right'], 'literal pipe decoded')
  t.deepEqual(page.links().map((item) => [item.json().target, item.json().alias]), [['Note', 'Label']], 'escaped wikilink alias separator')
  t.deepEqual(page.embeds().map((item) => [item.json().target, item.json().width]), [['image.png', 100]], 'escaped embed size separator')
})

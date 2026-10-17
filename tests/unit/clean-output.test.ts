import test from 'tape'
import parsePage from '../lib.ts'

test('text defaults keep heading markers and omit non-prose sections', (t) => {
  const page = parsePage('---\ntitle: Metadata\n---\n\n## Heading\n\n![[photo.png]]\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n<div>Markup</div>\n\nBody')
  t.equal(page.text(), '## Heading\n\nBody')
  t.equal(page.embeds()[0].text(), '')
  t.equal(page.tables()[0].text(), '')
  t.equal(page.frontmatter()[0].text(), '')
  t.equal(page.text({ headings: 'inline' }), 'Heading\n\nBody')
  t.end()
})

test('HTML comments stay invisible even when their content contains markup', (t) => {
  const page = parsePage('Before %%--> <img src=x onerror=alert(1)> <!--%% after')
  const html = page.html()
  t.ok(html.includes('<!-- '))
  t.equal((html.match(/-->/g) || []).length, 1, 'only the renderer closes the comment')
  t.notOk(html.includes('<img'), 'comment content cannot inject markup')
  t.notOk(html.includes('<span'), 'comments do not become visible spans')
  t.equal(page.html({ comments: false }), '<p>Before  after</p>')
  t.equal(page.comments()[0].html({ comments: false }), '')
  t.equal(page.comments()[0].text(), '')
  t.end()
})

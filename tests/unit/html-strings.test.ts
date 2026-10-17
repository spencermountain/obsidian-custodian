import test from 'tape'
import parsePage from '../lib.ts'

test('direct HTML rendering escapes labels, attributes, and literal markup', (t) => {
  const page = parsePage('[Label](https://example.com)')
  const link = page.links()[0]
  link.title = '<b>"quoted" & literal</b>'
  link.target = 'https://example.com/" onmouseover="alert(1)'
  const html = page.html()
  t.ok(html.includes('&lt;b&gt;'), 'label markup is literal')
  t.ok(html.includes('&amp; literal'), 'ampersands are escaped')
  t.notOk(html.includes('<b>'), 'label cannot create markup')
  t.notOk(html.includes('" onmouseover="'), 'destination cannot create attributes')
  t.ok(parsePage('<script>alert(1)</script>').html().includes('&lt;script&gt;'), 'raw script is displayed as text')
  t.equal(parsePage('<script>alert(1)</script>').html({ html: false }), '', 'raw HTML can be omitted')
  t.end()
})

test('direct HTML rendering rejects executable URL protocols', (t) => {
  const page = parsePage('[Label](https://example.com)')
  const link = page.links()[0]
  const targets = ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)']
  targets.forEach(target => {
    link.target = target
    t.notOk(link.html().includes('href='), `rejects ${JSON.stringify(target)}`)
    t.ok(link.html().includes('Label'), 'keeps link label')
  })
  link.target = 'mailto:test@example.com'
  t.ok(link.html().includes('href="mailto:test@example.com"'), 'allows mail links')
  link.target = '../notes/next.md'
  t.ok(link.html().includes('href="../notes/next.md"'), 'allows relative paths')
  t.end()
})

test('direct HTML rendering handles ordered, nested, and loose lists', (t) => {
  const html = parsePage('3. First\n4. Second\n   - Nested\n\n- Loose first\n\n- Loose second').html()
  t.ok(html.includes('<ol start="3">'))
  t.ok(html.includes('<li>First</li>'), 'tight items omit paragraph wrappers')
  t.ok(html.includes('<ul>\n') || html.includes('<ul><li>'), 'nested list is retained')
  t.ok(html.includes('<p>Loose first</p>'), 'loose items retain paragraphs')
  t.end()
})

test('repeated footnotes receive unique IDs and working backlinks', (t) => {
  const html = parsePage('One[^café], again[^café].\n\n[^café]: A note').html()
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1])
  const links = [...html.matchAll(/\shref="#([^"]+)"/g)].map(match => decodeURIComponent(match[1]))
  t.equal(new Set(ids).size, ids.length, 'IDs are unique')
  links.forEach(id => t.ok(ids.includes(id), `target ${id} exists`))
  t.end()
})

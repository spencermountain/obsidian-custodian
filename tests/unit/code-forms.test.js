import { fixture, nodes, values } from '../fixture.js'

fixture('code/inline-code', (t, page) => {
  t.deepEqual(values(page, 'inlineCode'), [
    'const answer = 42', 'a ` b', '[[Not a link]]', '==not a highlight==', '%%not a comment%%'
  ], 'code spans and embedded backtick')
  t.equal(page.code().length, 0, 'inline code is not a code block')
  t.equal(page.links().length, 0, 'code wikilink stays literal')
  t.equal(page.highlights().length, 0, 'code highlight stays literal')
  t.equal(page.comments().length, 0, 'code comment stays literal')
})

fixture('code/fenced-code', (t, page) => {
  t.deepEqual(page.code().map((item) => {
    const { lang, meta, value } = item.json()
    return { lang, meta, value }
  }), [
    { lang: 'javascript', meta: 'title="example.js"', value: "const greeting = 'Hello world'\nconsole.log(greeting)" },
    { lang: null, meta: null, value: 'A fence without a language.\n[[This stays literal]]' }
  ], 'language, metadata, and exact code contents')
  t.equal(page.links().length, 0, 'wikilink inside fence stays literal')
})

fixture('code/tilde-fence', (t, page) => {
  t.equal(page.code().length, 1, 'backtick fence stays inside tilde fence')
  t.equal(page.code()[0]?.json().lang, 'markdown', 'fence language')
  t.equal(page.code()[0]?.json().value, [
    '# A literal heading', '', '**Literal emphasis** and [[a literal wikilink]].', '',
    '```javascript', 'const nested = true', '```'
  ].join('\n'), 'nested fence preserved literally')
  t.equal(page.headings().length, 0, 'code heading stays literal')
  t.equal(page.links().length, 0, 'code wikilink stays literal')
  t.equal(nodes(page, 'strong').length, 0, 'code emphasis stays literal')
})

fixture('code/indented-code', (t, page) => {
  t.equal(page.code().length, 1, 'one indented code block')
  t.equal(page.code()[0]?.json().lang, null, 'no language')
  t.equal(page.code()[0]?.json().value, 'const answer = 42\nconsole.log(answer)\n\n[[This is code, not a link]]', 'indentation removed and internal blank line retained')
  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    'An indented block follows this paragraph.', 'A paragraph after the code.'
  ], 'outside paragraphs')
  t.equal(page.links().length, 0, 'indented wikilink stays literal')
})

fixture('html/block-html', (t, page) => {
  t.deepEqual(values(page, 'html'), [
    '<div class="example">\n**This stays literal inside HTML.**\n[[This is not a Markdown link.]]\n</div>'
  ], 'raw HTML retains its Markdown-looking contents')
  t.equal(page.links().length, 0, 'HTML wikilink stays literal')
  t.deepEqual(nodes(page, 'strong').map((node) => node.children[0]?.value), ['This paragraph uses Markdown.'], 'only outside emphasis parsed')
})

fixture('html/inline-html', (t, page) => {
  t.deepEqual(values(page, 'html'), ['<span class="example">**literal emphasis** and [[literal link]]</span>'], 'inline element is one literal HTML node')
  t.deepEqual(page.links().map((item) => item.json().target), ['Note'], 'only outside wikilink parsed')
  t.deepEqual(nodes(page, 'strong').map((node) => node.children[0]?.value), ['emphasis'], 'only outside emphasis parsed')
  const first = page.paragraphs()[0]?.ast()
  t.equal(first?.children[0]?.value, 'Before ', 'text before HTML')
  t.equal(first?.children.at(-1)?.value, ' after.', 'text after HTML')
})

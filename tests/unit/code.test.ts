import { nodes, values } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'

test('code/inline-code', (t) => {
  const input = readFile('code/inline-code')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(values(page, 'inlineCode'), [
    'const answer = 42', 'a ` b', '[[Not a link]]', '==not a highlight==', '%%not a comment%%'
  ], 'code spans and embedded backtick')
  t.equal(page.code().length, 0, 'inline code is not a code block')
  t.equal(page.links().length, 0, 'code wikilink stays literal')
  t.equal(page.highlights().length, 0, 'code highlight stays literal')
  t.equal(page.comments().length, 0, 'code comment stays literal')
  t.end()
})

test('code/inline-code - serialized and reparsed', (t) => {
  const input = readFile('code/inline-code')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(values(page, 'inlineCode'), [
    'const answer = 42', 'a ` b', '[[Not a link]]', '==not a highlight==', '%%not a comment%%'
  ], 'code spans and embedded backtick')
  t.equal(page.code().length, 0, 'inline code is not a code block')
  t.equal(page.links().length, 0, 'code wikilink stays literal')
  t.equal(page.highlights().length, 0, 'code highlight stays literal')
  t.equal(page.comments().length, 0, 'code comment stays literal')
  t.end()
})

test('code/fenced-code', (t) => {
  const input = readFile('code/fenced-code')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.code().map((item) => {
    const { lang, meta, value } = item.json()
    return { lang, meta, value }
  }), [
    { lang: 'javascript', meta: 'title="example.js"', value: "const greeting = 'Hello world'\nconsole.log(greeting)" },
    { lang: null, meta: null, value: 'A fence without a language.\n[[This stays literal]]' }
  ], 'language, metadata, and exact code contents')
  t.equal(page.links().length, 0, 'wikilink inside fence stays literal')
  t.end()
})

test('code/fenced-code - serialized and reparsed', (t) => {
  const input = readFile('code/fenced-code')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.code().map((item) => {
    const { lang, meta, value } = item.json()
    return { lang, meta, value }
  }), [
    { lang: 'javascript', meta: 'title="example.js"', value: "const greeting = 'Hello world'\nconsole.log(greeting)" },
    { lang: null, meta: null, value: 'A fence without a language.\n[[This stays literal]]' }
  ], 'language, metadata, and exact code contents')
  t.equal(page.links().length, 0, 'wikilink inside fence stays literal')
  t.end()
})

test('code/tilde-fence', (t) => {
  const input = readFile('code/tilde-fence')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(page.code().length, 1, 'backtick fence stays inside tilde fence')
  t.equal(page.code()[0]?.json().lang, 'markdown', 'fence language')
  t.equal(page.code()[0]?.json().value, [
    '# A literal heading', '', '**Literal emphasis** and [[a literal wikilink]].', '',
    '```javascript', 'const nested = true', '```'
  ].join('\n'), 'nested fence preserved literally')
  t.equal(page.headings().length, 0, 'code heading stays literal')
  t.equal(page.links().length, 0, 'code wikilink stays literal')
  t.equal(nodes(page, 'strong').length, 0, 'code emphasis stays literal')
  t.end()
})

test('code/tilde-fence - serialized and reparsed', (t) => {
  const input = readFile('code/tilde-fence')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(page.code().length, 1, 'backtick fence stays inside tilde fence')
  t.equal(page.code()[0]?.json().lang, 'markdown', 'fence language')
  t.equal(page.code()[0]?.json().value, [
    '# A literal heading', '', '**Literal emphasis** and [[a literal wikilink]].', '',
    '```javascript', 'const nested = true', '```'
  ].join('\n'), 'nested fence preserved literally')
  t.equal(page.headings().length, 0, 'code heading stays literal')
  t.equal(page.links().length, 0, 'code wikilink stays literal')
  t.equal(nodes(page, 'strong').length, 0, 'code emphasis stays literal')
  t.end()
})

test('code/indented-code', (t) => {
  const input = readFile('code/indented-code')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(page.code().length, 1, 'one indented code block')
  t.equal(page.code()[0]?.json().lang, null, 'no language')
  t.equal(page.code()[0]?.json().value, 'const answer = 42\nconsole.log(answer)\n\n[[This is code, not a link]]', 'indentation removed and internal blank line retained')
  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    'An indented block follows this paragraph.', 'A paragraph after the code.'
  ], 'outside paragraphs')
  t.equal(page.links().length, 0, 'indented wikilink stays literal')
  t.end()
})

test('code/indented-code - serialized and reparsed', (t) => {
  const input = readFile('code/indented-code')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(page.code().length, 1, 'one indented code block')
  t.equal(page.code()[0]?.json().lang, null, 'no language')
  t.equal(page.code()[0]?.json().value, 'const answer = 42\nconsole.log(answer)\n\n[[This is code, not a link]]', 'indentation removed and internal blank line retained')
  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    'An indented block follows this paragraph.', 'A paragraph after the code.'
  ], 'outside paragraphs')
  t.equal(page.links().length, 0, 'indented wikilink stays literal')
  t.end()
})

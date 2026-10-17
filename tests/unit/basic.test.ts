import { nodes } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'
const here = '[basic] '

test('basic/headings', (t) => {
  const md = readFile('basic/headings')
  const page = parsePage(md)
  const headings = page.headings().map((heading) => heading.json())

  t.equal(headings.length, 6, `${here} six-headings`)
  t.deepEqual(headings.map((heading) => heading.depth), [1, 2, 3, 4, 5, 6], `${here} heading-depths`)
  t.deepEqual(headings.map((heading) => heading.text), [
    'This is a heading 1', 'This is a heading 2', 'This is a heading 3',
    'This is a heading 4', 'This is a heading 5', 'This is a heading 6'
  ], `${here} heading-text`)
  t.deepEqual(page.json().headings, headings, `${here} json-headings`)
  t.equal(page.markdown(), md, `${here} output-same`)
  t.end()
})

test('basic/front-matter', (t) => {
  const md = readFile('basic/front-matter')
  const page = parsePage(md)
  const json = page.json()

  t.equal(json.frontmatter.length, 1, `${here} one-frontmatter`)
  t.equal(json.frontmatter[0]?.value, 'tags:\n  - recipe\n  - cooking', `${here} yaml-content`)
  t.deepEqual(page.paragraphs().map((paragraph) => paragraph.json().text), ['below text'], `${here} body-text`)
  t.equal(page.headings().length, 0, `${here} zero-headings`)
  t.equal(page.lists().length, 0, `${here} yaml-is-not-a-list`)
  t.equal(page.markdown(), md, `${here} output-same`)
  t.end()
})

test('basic/emphasis', (t) => {
  const input = readFile('basic/emphasis')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(nodes(page, 'emphasis').length, 5, 'five italic spans, including nested ones')
  t.equal(nodes(page, 'strong').length, 5, 'five bold spans, including nested ones')
  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    'Italic with asterisks and italic with underscores.',
    'Bold with asterisks and bold with underscores.',
    'Bold and italic, bold with italic inside, and italic with bold inside.'
  ], 'formatting preserves the words')
  t.ok(nodes(page, 'strong').some((node) => node.children.some((child) => child.type === 'emphasis')), 'italic inside bold')
  t.ok(nodes(page, 'emphasis').some((node) => node.children.some((child) => child.type === 'strong')), 'bold inside italic')
  t.end()
})

test('basic/emphasis - serialized and reparsed', (t) => {
  const input = readFile('basic/emphasis')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(nodes(page, 'emphasis').length, 5, 'five italic spans, including nested ones')
  t.equal(nodes(page, 'strong').length, 5, 'five bold spans, including nested ones')
  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    'Italic with asterisks and italic with underscores.',
    'Bold with asterisks and bold with underscores.',
    'Bold and italic, bold with italic inside, and italic with bold inside.'
  ], 'formatting preserves the words')
  t.ok(nodes(page, 'strong').some((node) => node.children.some((child) => child.type === 'emphasis')), 'italic inside bold')
  t.ok(nodes(page, 'emphasis').some((node) => node.children.some((child) => child.type === 'strong')), 'bold inside italic')
  t.end()
})

test('basic/strikethrough', (t) => {
  const input = readFile('basic/strikethrough')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(nodes(page, 'delete').map((node) => node.children[0]?.value), [
    'remove this', 'remove this boldly'
  ], 'double tildes create deletion spans')
  t.equal(nodes(page, 'strong')[0]?.children[0]?.type, 'delete', 'deletion nests inside bold')
  t.equal(page.paragraphs()[1]?.text(), 'A single ~tilde~ stays literal with the default settings.', 'single tildes remain literal')
  t.end()
})

test('basic/strikethrough - serialized and reparsed', (t) => {
  const input = readFile('basic/strikethrough')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(nodes(page, 'delete').map((node) => node.children[0]?.value), [
    'remove this', 'remove this boldly'
  ], 'double tildes create deletion spans')
  t.equal(nodes(page, 'strong')[0]?.children[0]?.type, 'delete', 'deletion nests inside bold')
  t.equal(page.paragraphs()[1]?.text(), 'A single ~tilde~ stays literal with the default settings.', 'single tildes remain literal')
  t.end()
})

test('basic/paragraphs-and-breaks', (t) => {
  const input = readFile('basic/paragraphs-and-breaks')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    'The first line of a paragraph\ncontinues on the next line.',
    'A second paragraph has a hard break here\nand continues on a new line.',
    'A final paragraph.'
  ], 'paragraph boundaries and line breaks')
  t.equal(nodes(page, 'break').length, 1, 'only the explicit hard break creates a break node')
  t.equal(page.paragraphs()[0]?.ast().children.length, 1, 'soft break stays in text')
  t.end()
})

test('basic/paragraphs-and-breaks - serialized and reparsed', (t) => {
  const input = readFile('basic/paragraphs-and-breaks')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    'The first line of a paragraph\ncontinues on the next line.',
    'A second paragraph has a hard break here\nand continues on a new line.',
    'A final paragraph.'
  ], 'paragraph boundaries and line breaks')
  t.equal(nodes(page, 'break').length, 1, 'only the explicit hard break creates a break node')
  t.equal(page.paragraphs()[0]?.ast().children.length, 1, 'soft break stays in text')
  t.end()
})

test('basic/setext-headings', (t) => {
  const input = readFile('basic/setext-headings')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.headings().map((item) => [item.json().depth, item.text()]), [
    [1, 'A level-one heading'], [2, 'A level-two heading']
  ], 'setext heading levels')
  t.equal(nodes(page, 'thematicBreak').length, 0, 'heading underline is not a rule')
  t.deepEqual(page.paragraphs().map((item) => item.text()), ['A paragraph beneath the headings.'], 'body paragraph')
  t.end()
})

test('basic/setext-headings - serialized and reparsed', (t) => {
  const input = readFile('basic/setext-headings')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.headings().map((item) => [item.json().depth, item.text()]), [
    [1, 'A level-one heading'], [2, 'A level-two heading']
  ], 'setext heading levels')
  t.equal(nodes(page, 'thematicBreak').length, 0, 'heading underline is not a rule')
  t.deepEqual(page.paragraphs().map((item) => item.text()), ['A paragraph beneath the headings.'], 'body paragraph')
  t.end()
})

test('basic/thematic-breaks', (t) => {
  const input = readFile('basic/thematic-breaks')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(nodes(page, 'thematicBreak').length, 3, 'three rule styles')
  t.equal(page.paragraphs().length, 4, 'four surrounding paragraphs')
  t.equal(page.headings().length, 0, 'rules are not headings')
  t.equal(page.frontmatter().length, 0, 'rule inside the document is not YAML')
  t.end()
})

test('basic/thematic-breaks - serialized and reparsed', (t) => {
  const input = readFile('basic/thematic-breaks')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(nodes(page, 'thematicBreak').length, 3, 'three rule styles')
  t.equal(page.paragraphs().length, 4, 'four surrounding paragraphs')
  t.equal(page.headings().length, 0, 'rules are not headings')
  t.equal(page.frontmatter().length, 0, 'rule inside the document is not YAML')
  t.end()
})

test('basic/escapes-and-entities', (t) => {
  const input = readFile('basic/escapes-and-entities')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    '*Literal asterisks* and _literal underscores_.',
    '# Not a heading',
    '[[Not a wikilink]] and ==not highlighted==.',
    'An escaped block marker: ^not-a-block',
    'Fish & chips, <angle brackets>, and © 2026.'
  ], 'escaped punctuation and decoded entities')
  t.equal(page.headings().length, 0, 'escaped heading stays literal')
  t.equal(page.links().length, 0, 'escaped wikilink stays literal')
  t.equal(page.highlights().length, 0, 'escaped highlight stays literal')
  t.equal(nodes(page, 'emphasis').length, 0, 'escaped emphasis stays literal')
  t.equal(nodes(page, 'html').length, 0, 'decoded angle brackets are not HTML')
  t.equal(page.paragraphs().filter((item) => item.json().blockId).length, 0, 'escaped caret does not define a block')
  t.end()
})

test('basic/escapes-and-entities - serialized and reparsed', (t) => {
  const input = readFile('basic/escapes-and-entities')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    '*Literal asterisks* and _literal underscores_.',
    '# Not a heading',
    '[[Not a wikilink]] and ==not highlighted==.',
    'An escaped block marker: ^not-a-block',
    'Fish & chips, <angle brackets>, and © 2026.'
  ], 'escaped punctuation and decoded entities')
  t.equal(page.headings().length, 0, 'escaped heading stays literal')
  t.equal(page.links().length, 0, 'escaped wikilink stays literal')
  t.equal(page.highlights().length, 0, 'escaped highlight stays literal')
  t.equal(nodes(page, 'emphasis').length, 0, 'escaped emphasis stays literal')
  t.equal(nodes(page, 'html').length, 0, 'decoded angle brackets are not HTML')
  t.equal(page.paragraphs().filter((item) => item.json().blockId).length, 0, 'escaped caret does not define a block')
  t.end()
})

test('basic/front-matter-properties', (t) => {
  const input = readFile('basic/front-matter-properties')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(page.frontmatter().length, 1, 'one YAML section')
  t.equal(page.frontmatter()[0]?.json().value, [
    'title: "A note: with punctuation"', 'aliases:', '  - Example note', '  - Another name',
    'tags: [notes, examples]', 'published: false', 'rating: 3', 'summary: |',
    '  A description on', '  multiple lines.'
  ].join('\n'), 'YAML values and indentation remain raw')
  t.deepEqual(page.headings().map((item) => item.text()), ['A note with properties'], 'heading after YAML')
  t.equal(page.lists().length, 0, 'YAML arrays are not Markdown lists')
  t.deepEqual(page.paragraphs().map((item) => item.text()), ['The YAML above is metadata, not a Markdown list.'], 'body after YAML')
  t.end()
})

test('basic/front-matter-properties - serialized and reparsed', (t) => {
  const input = readFile('basic/front-matter-properties')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(page.frontmatter().length, 1, 'one YAML section')
  t.equal(page.frontmatter()[0]?.json().value, [
    'title: "A note: with punctuation"', 'aliases:', '  - Example note', '  - Another name',
    'tags: [notes, examples]', 'published: false', 'rating: 3', 'summary: |',
    '  A description on', '  multiple lines.'
  ].join('\n'), 'YAML values and indentation remain raw')
  t.deepEqual(page.headings().map((item) => item.text()), ['A note with properties'], 'heading after YAML')
  t.equal(page.lists().length, 0, 'YAML arrays are not Markdown lists')
  t.deepEqual(page.paragraphs().map((item) => item.text()), ['The YAML above is metadata, not a Markdown list.'], 'body after YAML')
  t.end()
})

test('frontmatter exposes structured properties without replacing YAML', (t) => {
  const input = '---\ntags: [one, two]\naliases:\n  - Alternate\npublished: false\ncount: 3\n---'
  const page = parsePage(input)
  t.deepEqual(page.frontmatter()[0]?.json().properties, { tags: ['one', 'two'], aliases: ['Alternate'], published: false, count: 3 })
  t.ok(page.frontmatter()[0]?.json().value.includes('tags: [one, two]'))
  page.frontmatter()[0].update({ value: 'tags: [changed]' })
  t.deepEqual(page.frontmatter()[0]?.json().properties, { tags: ['changed'] })
  t.doesNotThrow(() => parsePage('---\nbroken: [\n---').json(), 'invalid YAML remains readable')
  t.end()
})

test('invalid YAML reports errors and property output is detached', (t) => {
  const invalid = parsePage('---\nbroken: [\n---').frontmatter()[0].json()
  t.ok(invalid.propertiesError)
  t.equal(invalid.value, 'broken: [')
  const page = parsePage('---\ntags: [one]\n---')
  page.frontmatter()[0].json().properties.tags.push('mutated')
  t.deepEqual(page.frontmatter()[0].json().properties, { tags: ['one'] })
  t.end()
})

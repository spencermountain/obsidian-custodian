import { fixture, nodes } from '../fixture.ts'

fixture('basic/emphasis', (t, page) => {
  t.equal(nodes(page, 'emphasis').length, 5, 'five italic spans, including nested ones')
  t.equal(nodes(page, 'strong').length, 5, 'five bold spans, including nested ones')
  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    'Italic with asterisks and italic with underscores.',
    'Bold with asterisks and bold with underscores.',
    'Bold and italic, bold with italic inside, and italic with bold inside.'
  ], 'formatting preserves the words')
  t.ok(nodes(page, 'strong').some((node) => node.children.some((child) => child.type === 'emphasis')), 'italic inside bold')
  t.ok(nodes(page, 'emphasis').some((node) => node.children.some((child) => child.type === 'strong')), 'bold inside italic')
})

fixture('basic/strikethrough', (t, page) => {
  t.deepEqual(nodes(page, 'delete').map((node) => node.children[0]?.value), [
    'remove this', 'remove this boldly'
  ], 'double tildes create deletion spans')
  t.equal(nodes(page, 'strong')[0]?.children[0]?.type, 'delete', 'deletion nests inside bold')
  t.equal(page.paragraphs()[1]?.text(), 'A single ~tilde~ stays literal with the default settings.', 'single tildes remain literal')
})

fixture('basic/paragraphs-and-breaks', (t, page) => {
  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    'The first line of a paragraph\ncontinues on the next line.',
    'A second paragraph has a hard break here\nand continues on a new line.',
    'A final paragraph.'
  ], 'paragraph boundaries and line breaks')
  t.equal(nodes(page, 'break').length, 1, 'only the explicit hard break creates a break node')
  t.equal(page.paragraphs()[0]?.ast().children.length, 1, 'soft break stays in text')
})

fixture('basic/setext-headings', (t, page) => {
  t.deepEqual(page.headings().map((item) => [item.json().depth, item.text()]), [
    [1, 'A level-one heading'], [2, 'A level-two heading']
  ], 'setext heading levels')
  t.equal(nodes(page, 'thematicBreak').length, 0, 'heading underline is not a rule')
  t.deepEqual(page.paragraphs().map((item) => item.text()), ['A paragraph beneath the headings.'], 'body paragraph')
})

fixture('basic/thematic-breaks', (t, page) => {
  t.equal(nodes(page, 'thematicBreak').length, 3, 'three rule styles')
  t.equal(page.paragraphs().length, 4, 'four surrounding paragraphs')
  t.equal(page.headings().length, 0, 'rules are not headings')
  t.equal(page.frontmatter().length, 0, 'rule inside the document is not YAML')
})

fixture('basic/escapes-and-entities', (t, page) => {
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
  t.equal(page.blocks().filter((item) => item.json().blockId).length, 0, 'escaped caret does not define a block')
})

fixture('basic/front-matter-properties', (t, page) => {
  t.equal(page.frontmatter().length, 1, 'one YAML section')
  t.equal(page.frontmatter()[0]?.json().value, [
    'title: "A note: with punctuation"', 'aliases:', '  - Example note', '  - Another name',
    'tags: [notes, examples]', 'published: false', 'rating: 3', 'summary: |',
    '  A description on', '  multiple lines.'
  ].join('\n'), 'YAML values and indentation remain raw')
  t.deepEqual(page.headings().map((item) => item.text()), ['A note with properties'], 'heading after YAML')
  t.equal(page.lists().length, 0, 'YAML arrays are not Markdown lists')
  t.deepEqual(page.paragraphs().map((item) => item.text()), ['The YAML above is metadata, not a Markdown list.'], 'body after YAML')
})

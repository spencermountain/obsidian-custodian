import { fixture, nodes, values } from '../fixture.js'

fixture('math/inline-math', (t, page) => {
  t.deepEqual(page.math().map((item) => [item.json().type, item.json().value]), [
    ['inlineMath', 'E = mc^2'], ['inlineMath', 'A = \\pi r^2'], ['inlineMath', '\\frac{a}{b}']
  ], 'inline formulas preserve LaTeX')
  t.equal(page.paragraphs().length, 2, 'math remains inside paragraphs')
  t.equal(page.code().length, 0, 'math is not code')
})

fixture('math/block-math', (t, page) => {
  t.equal(page.math().length, 1, 'one display formula')
  t.equal(page.math()[0]?.json().type, 'math', 'display math node')
  t.equal(page.math()[0]?.json().value, [
    '\\begin{aligned}', 'a^2 + b^2 &= c^2 \\\\',
    'x &= \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', '\\end{aligned}'
  ].join('\n'), 'LaTeX line breaks and commands preserved')
  t.deepEqual(page.paragraphs().map((item) => item.text()), ['Before the equation.', 'After the equation.'], 'surrounding paragraphs')
})

fixture('footnotes/simple-footnote', (t, page) => {
  t.deepEqual(page.footnotes().map((item) => [item.json().identifier, item.text()]), [
    ['source', 'The source of the statement.']
  ], 'footnote definition and content')
  t.deepEqual(nodes(page, 'footnoteReference').map((node) => node.identifier), ['source'], 'matching reference')
  t.equal(page.links().length, 0, 'footnote reference is not an ordinary link')
})

fixture('footnotes/multiple-paragraphs', (t, page) => {
  t.deepEqual(page.footnotes().map((item) => item.json().identifier), ['detail', 'other'], 'two definitions')
  t.deepEqual(nodes(page, 'footnoteReference').map((node) => node.identifier), ['detail', 'detail', 'other'], 'repeated references retained')
  const definitions = nodes(page, 'footnoteDefinition')
  t.deepEqual(definitions[0]?.children.map((node) => node.type), ['paragraph', 'paragraph', 'list'], 'multi-paragraph definition with a list')
  t.equal(definitions[1]?.children[0]?.children[0]?.value, 'A different footnote.', 'second definition content')
  t.deepEqual(page.lists()[0]?.json().items.map((item) => item.text), ['A supporting point', 'Another supporting point'], 'footnote list content')
  t.equal(nodes(page, 'strong')[0]?.children[0]?.value, 'formatted text', 'footnote inline formatting')
  t.deepEqual(values(page, 'blockId'), [], 'footnotes are not Obsidian block IDs')
})

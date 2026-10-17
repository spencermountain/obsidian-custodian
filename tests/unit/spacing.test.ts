import test from 'tape'
import parsePage from '../lib.ts'

const examples = [
  ['paragraphs', 'First\n\n\n\n[[Note]]'],
  ['headings', '# Heading\n\n\n[[Note]]'],
  ['lists', '- Item\n\n\n\n[[Note]]'],
  ['quotes', '> First\n>\n>\n> [[Note]]'],
  ['callouts', '> [!note] Title\n> First\n>\n>\n> [[Note]]'],
  ['callout title and body', '> [!note] Title\n>\n>\n> [[Note]]'],
  ['nested quotes', '> > First\n> >\n> >\n> > [[Note]]'],
  ['list paragraphs', '- First\n\n\n  [[Note]]']
]

examples.forEach(([name, source]) => {
  test(`preserve blank lines between ${name} after editing`, (t) => {
    const page = parsePage(source)
    page.links()[0].title = 'Label'
    const output = page.markdown()
    // Ignore trailing spaces on empty quote lines and the final newline.
    const clean = (value: string) => value.replace(/^>[ \t]+$/gm, '>').trimEnd()
    t.equal(clean(output), clean(source.replace('[[Note]]', '[[Note|Label]]')), 'keeps the original gaps')
    const reparsed = parsePage(output)
    t.equal(reparsed.text(), page.text(), 'keeps content and structure when parsed again')
    reparsed.links()[0].title = 'Again'
    t.equal(clean(reparsed.markdown()), clean(source.replace('[[Note]]', '[[Note|Again]]')), 'keeps gaps through repeated edits')
    t.end()
  })
})

test('new blocks use normal spacing beside preserved gaps', (t) => {
  const page = parsePage('First\n\n\n\nSecond')
  page.append('Third')
  t.equal(page.markdown(), 'First\n\n\n\nSecond\n\nThird\n')
  t.end()
})

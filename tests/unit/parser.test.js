import test from 'tape'
import parsePage from '../../src/index.js'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkObsidian from '../../src/remark.js'

test('public API exposes flat, detached JSON and exact untouched Markdown', (t) => {
  const input = '# Hello **world**\r\n\r\nhello [[world]]\r\n\r\n![[path/to/myFile.jpg|500]]'
  const page = parsePage(input)
  t.equal(page.markdown(), input)
  t.equal(page.headings()[0].json().text, 'Hello world')
  t.equal(page.json().links[0].target, 'world')
  t.equal(page.json().embeds[0].width, 500)
  t.equal(page.json().embeds[0].target, 'path/to/myFile.jpg')
  const ast = page.ast()
  ast.children.length = 0
  t.equal(page.headings().length, 1)
  t.ok(JSON.stringify(page.json()))
  t.end()
})

test('Obsidian syntax, standard plugins, and protected literal contexts', (t) => {
  const page = parsePage(
    '---\ntitle: Test\n---\n\n> [!TIP]- **Title**\n> Body [[Note#Heading|label]]\n\n==**marked**== %%hidden [[no]]%%\n\nA block ^my-id\n\n- [?] custom task\n- [ ] todo\n\n`[[code]]` \\[[escaped]]\n\n```js\n[[code]]\n```\n\n$x^2$\n\n| A | B |\n| - | - |\n| [[Note\\|Alias]] | yes |\n\nFootnote[^one]\n\n[^one]: Text'
  )
  t.equal(page.callouts()[0].json().calloutType, 'tip')
  t.equal(page.callouts()[0].json().fold, 'collapsed')
  t.equal(page.highlights()[0].json().text, 'marked')
  t.equal(page.comments()[0].json().text, 'hidden [[no]]')
  t.equal(page.links().length, 2)
  t.equal(page.links()[1].json().alias, 'Alias')
  t.equal(
    page
      .blocks()
      .find((block) => block.json().blockId === 'my-id')
      .json().text,
    'A block'
  )
  t.equal(page.tasks()[0].json().checked, true)
  t.equal(page.tasks()[1].json().checked, false)
  t.equal(page.json().frontmatter[0].value, 'title: Test')
  t.equal(page.json().tables.length, 1)
  t.equal(page.json().math.length, 1)
  t.equal(page.json().footnotes.length, 1)
  t.end()
})

test('structured edits validate input and survive a parse/serialize cycle', (t) => {
  const page = parsePage('# Old\n\n[[Note#^block|alias]]\n\n- [ ] task\n\n%%keep%%')
  const heading = page.headings()[0]
  heading.update({ text: 'New *literal*', depth: 2 })
  page.links()[0].update({ target: 'Other', alias: 'New alias' })
  page.tasks()[0].update({ checked: true })
  const edited = parsePage(page.markdown())
  t.equal(edited.headings()[0].json().text, 'New *literal*')
  t.equal(edited.headings()[0].json().depth, 2)
  t.equal(edited.links()[0].json().target, 'Other')
  t.equal(edited.links()[0].json().block, 'block')
  t.equal(edited.tasks()[0].json().checked, true)
  t.equal(edited.comments().length, 1)
  t.throws(() => heading.update({ depth: 7 }), /depth/i)
  t.throws(() => page.links()[0].update({ target: 'bad]]target' }), /target/i)
  heading.remove()
  t.equal(page.headings().length, 0)
  t.throws(() => heading.update({ text: 'stale' }), /removed|detached/i)
  t.end()
})

test('remark entry point parses and serializes custom nodes', (t) => {
  const processor = unified().use(remarkParse).use(remarkObsidian).use(remarkStringify)
  const source =
    '[[Note|alias]] ![[image.png|40x20]] ==bold== %%hidden%%\n\n> [!note]+ Title\n> Text'
  const tree = processor.runSync(processor.parse(source))
  const result = String(processor.stringify(tree))
  t.ok(result.includes('[[Note|alias]]'))
  t.ok(result.includes('![[image.png|40x20]]'))
  t.ok(result.includes('==bold=='))
  t.ok(result.includes('%%hidden%%'))
  t.ok(result.includes('[!note]+'))
  t.end()
})

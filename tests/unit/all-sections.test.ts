import test from 'tape'
import parsePage from '../lib.ts'

test('sections includes all descendants in document order', (t) => {
  const page = parsePage('# Heading\n\nHello **bold**.\n\n---')
  t.deepEqual(page.sections().map(section => section.ast().type), [
    'heading', 'text', 'paragraph', 'text', 'strong', 'text', 'text', 'thematicBreak'
  ])
  t.equal(page.sections('strong')[0].text(), 'bold')
  t.equal(page.sections('thematicBreak')[0].html(), '<hr>')
  t.deepEqual(page.sections('missing'), [])
  t.deepEqual(page.sections('root'), [], 'the page root is not a removable section')
  t.deepEqual(parsePage('').sections(), [])
  t.end()
})

test('selected sections can be removed in a loop', (t) => {
  const page = parsePage('Before\n\n---\n\nAfter\n\n***')
  page.sections('thematicBreak').forEach(section => section.remove())
  t.equal(page.sections('thematicBreak').length, 0)
  t.equal(page.text(), 'Before\nAfter')
  t.notOk(page.html().includes('<hr>'))
  t.end()
})

test('all sections can be removed from descendants to parents', (t) => {
  const page = parsePage('> Quote **bold**\n\n- [ ] Task\n\n## Heading')
  const sections = page.sections()
  sections.reverse().forEach(section => section.remove())
  t.deepEqual(page.sections(), [])
  t.equal(page.markdown(), '')
  t.equal(page.html(), '')
  t.end()
})

test('general selection returns live specialized handles', (t) => {
  const page = parsePage('[[Original]]')
  page.sections('wikiLink')[0].update({ target: 'Changed' })
  t.equal(page.links()[0].target, 'Changed')
  t.equal(page.markdown(), '[[Changed]]\n')
  t.end()
})

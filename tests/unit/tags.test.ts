import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'

test('tags are structured and survive serialization', (t) => {
  const input = readFile('tags/inline-tags')
  const page = parsePage(input)
  t.deepEqual(page.json().tags?.map(item => item.value), ['tag', 'nested/tag', 'y1984'])
  t.equal(page.tags().length, 3)
  page.append('')
  const reparsed = parsePage(page.markdown())
  t.deepEqual(reparsed.json().tags?.map(item => item.value), ['tag', 'nested/tag', 'y1984'])
  t.equal(page.tags()[0]?.text(), '#tag')
  t.equal(page.text({ tags: false }).includes('#nested/tag'), false)
  t.end()
})

test('Unicode tags stop at punctuation and ignore protected contexts', (t) => {
  const page = parsePage('#日本語。 #café #🦊 #123 `#code` %%#comment%% <span>#html</span> word#suffix')
  t.deepEqual(page.tags().map(item => item.json().value), ['日本語', 'café', '🦊'])
  page.append('')
  t.deepEqual(parsePage(page.markdown()).tags().map(item => item.json().value), ['日本語', 'café', '🦊'])
  t.end()
})

import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'
const here = '[lists] '

test('lists/with-block', (t) => {
  const md = readFile('lists/with-block')
  const page = parsePage(md)
  const lists = page.lists().map((list) => list.json())

  t.equal(lists.length, 1, `${here} one-list`)
  t.equal(lists[0]?.ordered, false, `${here} unordered`)
  t.equal(lists[0]?.blockId, 'my-list-id', `${here} block-id-on-list`)
  t.deepEqual(lists[0]?.items, [
    { text: 'list item 1', checked: null },
    { text: 'list item 2', checked: null }
  ], `${here} items`)
  t.equal(page.tasks().length, 0, `${here} zero-tasks`)
  t.deepEqual(page.json().lists, lists, `${here} json-lists`)
  t.equal(page.markdown(), md, `${here} output-same`)
  t.end()
})

import { nodes } from '../_lib.ts'
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

test('lists/unordered', (t) => {
  const input = readFile('lists/unordered')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.lists().map((item) => item.json().ordered), [false, false, false], 'three unordered lists')
  t.deepEqual(page.lists().map((item) => item.json().items.map((child) => child.text)), [
    ['First dash item', 'Second dash item'],
    ['First asterisk item', 'Second asterisk item'],
    ['First plus item', 'Second plus item']
  ], 'all bullet styles preserve items')
  t.equal(page.tasks().length, 0, 'ordinary items are not tasks')
  t.end()
})

test('lists/unordered - serialized and reparsed', (t) => {
  const input = readFile('lists/unordered')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.lists().map((item) => item.json().ordered), [false, false, false], 'three unordered lists')
  t.deepEqual(page.lists().map((item) => item.json().items.map((child) => child.text)), [
    ['First dash item', 'Second dash item'],
    ['First asterisk item', 'Second asterisk item'],
    ['First plus item', 'Second plus item']
  ], 'all bullet styles preserve items')
  t.equal(page.tasks().length, 0, 'ordinary items are not tasks')
  t.end()
})

test('lists/ordered', (t) => {
  const input = readFile('lists/ordered')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.lists().map((item) => [item.json().ordered, item.json().start]), [
    [true, 3], [true, 1]
  ], 'ordered starts and both marker styles')
  t.deepEqual(page.lists().map((item) => item.json().items.map((child) => child.text)), [
    ['Start at three', 'Continue at four', 'Finish at five'], ['First item', 'Second item']
  ], 'ordered item contents')
  t.end()
})

test('lists/ordered - serialized and reparsed', (t) => {
  const input = readFile('lists/ordered')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.lists().map((item) => [item.json().ordered, item.json().start]), [
    [true, 3], [true, 1]
  ], 'ordered starts and both marker styles')
  t.deepEqual(page.lists().map((item) => item.json().items.map((child) => child.text)), [
    ['Start at three', 'Continue at four', 'Finish at five'], ['First item', 'Second item']
  ], 'ordered item contents')
  t.end()
})

test('lists/nested', (t) => {
  const input = readFile('lists/nested')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  const lists = nodes(page, 'list')
  t.deepEqual(lists.map((node) => node.ordered), [false, false, false, true], 'mixed list types in traversal order')
  t.deepEqual(lists.map((node) => node.children.length), [2, 2, 1, 2], 'items at each nesting level')
  const root = lists[0]
  t.equal(root?.children[0]?.children[1]?.type, 'list', 'child list belongs to the first parent')
  t.equal(root?.children[0]?.children[1]?.children[0]?.children[1]?.type, 'list', 'grandchild belongs to its child item')
  t.equal(root?.children[1]?.children[1]?.ordered, true, 'ordered list belongs to the second parent')
  t.end()
})

test('lists/nested - serialized and reparsed', (t) => {
  const input = readFile('lists/nested')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  const lists = nodes(page, 'list')
  t.deepEqual(lists.map((node) => node.ordered), [false, false, false, true], 'mixed list types in traversal order')
  t.deepEqual(lists.map((node) => node.children.length), [2, 2, 1, 2], 'items at each nesting level')
  const root = lists[0]
  t.equal(root?.children[0]?.children[1]?.type, 'list', 'child list belongs to the first parent')
  t.equal(root?.children[0]?.children[1]?.children[0]?.children[1]?.type, 'list', 'grandchild belongs to its child item')
  t.equal(root?.children[1]?.children[1]?.ordered, true, 'ordered list belongs to the second parent')
  t.end()
})

test('lists/loose-items', (t) => {
  const input = readFile('lists/loose-items')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  const lists = nodes(page, 'list')
  t.equal(lists.length, 1, 'one list despite intervening blank lines')
  t.equal(lists[0]?.spread, true, 'loose list')
  t.deepEqual(lists[0]?.children.map((item) => item.children.map((child) => child.type)), [
    ['paragraph', 'paragraph'], ['paragraph', 'blockquote', 'paragraph']
  ], 'paragraphs and quote stay inside their items')
  t.equal(nodes(page, 'blockquote')[0]?.children[0]?.children[0]?.value, 'A quote inside the item.', 'quote contents')
  t.end()
})

test('lists/loose-items - serialized and reparsed', (t) => {
  const input = readFile('lists/loose-items')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  const lists = nodes(page, 'list')
  t.equal(lists.length, 1, 'one list despite intervening blank lines')
  t.equal(lists[0]?.spread, true, 'loose list')
  t.deepEqual(lists[0]?.children.map((item) => item.children.map((child) => child.type)), [
    ['paragraph', 'paragraph'], ['paragraph', 'blockquote', 'paragraph']
  ], 'paragraphs and quote stay inside their items')
  t.equal(nodes(page, 'blockquote')[0]?.children[0]?.children[0]?.value, 'A quote inside the item.', 'quote contents')
  t.end()
})

test('lists/tasks', (t) => {
  const input = readFile('lists/tasks')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.tasks().map((item) => item.json().checked), [false, true, true, false, true, false], 'checkbox states including uppercase X')
  const lists = nodes(page, 'list')
  t.equal(lists.length, 2, 'top-level and child task list')
  t.equal(lists[0]?.children.length, 4, 'four top-level tasks')
  t.equal(lists[0]?.children[3]?.children[1]?.children.length, 2, 'child tasks belong to the parent task')
  t.equal(lists[1]?.children[0]?.children[0]?.children[0]?.value, 'A completed child', 'checkbox removed from task content')
  t.end()
})

test('lists/tasks - serialized and reparsed', (t) => {
  const input = readFile('lists/tasks')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.tasks().map((item) => item.json().checked), [false, true, true, false, true, false], 'checkbox states including uppercase X')
  const lists = nodes(page, 'list')
  t.equal(lists.length, 2, 'top-level and child task list')
  t.equal(lists[0]?.children.length, 4, 'four top-level tasks')
  t.equal(lists[0]?.children[3]?.children[1]?.children.length, 2, 'child tasks belong to the parent task')
  t.equal(lists[1]?.children[0]?.children[0]?.children[0]?.value, 'A completed child', 'checkbox removed from task content')
  t.end()
})

test('lists/custom-task-markers', (t) => {
  const input = readFile('lists/custom-task-markers')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.tasks().map((item) => item.json().checked), [true, true, true, false], 'custom markers are checked')
  t.deepEqual(page.tasks().map((item) => item.json().taskMarker ?? null), ['?', '-', '!', null], 'custom markers survive serialization')
  t.deepEqual(page.tasks().map((item) => item.text()), [
    'Needs clarification', 'Cancelled task', 'Important task', 'Still incomplete'
  ], 'task text excludes markers')
  t.end()
})

test('lists/custom-task-markers - serialized and reparsed', (t) => {
  const input = readFile('lists/custom-task-markers')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.tasks().map((item) => item.json().checked), [true, true, true, false], 'custom markers are checked')
  t.deepEqual(page.tasks().map((item) => item.json().taskMarker ?? null), ['?', '-', '!', null], 'custom markers survive serialization')
  t.deepEqual(page.tasks().map((item) => item.text()), [
    'Needs clarification', 'Cancelled task', 'Important task', 'Still incomplete'
  ], 'task text excludes markers')
  t.end()
})

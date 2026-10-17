import { fixture, nodes } from '../fixture.ts'

fixture('lists/unordered', (t, page) => {
  t.deepEqual(page.lists().map((item) => item.json().ordered), [false, false, false], 'three unordered lists')
  t.deepEqual(page.lists().map((item) => item.json().items.map((child) => child.text)), [
    ['First dash item', 'Second dash item'],
    ['First asterisk item', 'Second asterisk item'],
    ['First plus item', 'Second plus item']
  ], 'all bullet styles preserve items')
  t.equal(page.tasks().length, 0, 'ordinary items are not tasks')
})

fixture('lists/ordered', (t, page) => {
  t.deepEqual(page.lists().map((item) => [item.json().ordered, item.json().start]), [
    [true, 3], [true, 1]
  ], 'ordered starts and both marker styles')
  t.deepEqual(page.lists().map((item) => item.json().items.map((child) => child.text)), [
    ['Start at three', 'Continue at four', 'Finish at five'], ['First item', 'Second item']
  ], 'ordered item contents')
})

fixture('lists/nested', (t, page) => {
  const lists = nodes(page, 'list')
  t.deepEqual(lists.map((node) => node.ordered), [false, false, false, true], 'mixed list types in traversal order')
  t.deepEqual(lists.map((node) => node.children.length), [2, 2, 1, 2], 'items at each nesting level')
  const root = lists[0]
  t.equal(root?.children[0]?.children[1]?.type, 'list', 'child list belongs to the first parent')
  t.equal(root?.children[0]?.children[1]?.children[0]?.children[1]?.type, 'list', 'grandchild belongs to its child item')
  t.equal(root?.children[1]?.children[1]?.ordered, true, 'ordered list belongs to the second parent')
})

fixture('lists/loose-items', (t, page) => {
  const lists = nodes(page, 'list')
  t.equal(lists.length, 1, 'one list despite intervening blank lines')
  t.equal(lists[0]?.spread, true, 'loose list')
  t.deepEqual(lists[0]?.children.map((item) => item.children.map((child) => child.type)), [
    ['paragraph', 'paragraph'], ['paragraph', 'blockquote', 'paragraph']
  ], 'paragraphs and quote stay inside their items')
  t.equal(nodes(page, 'blockquote')[0]?.children[0]?.children[0]?.value, 'A quote inside the item.', 'quote contents')
})

fixture('lists/tasks', (t, page) => {
  t.deepEqual(page.tasks().map((item) => item.json().checked), [false, true, true, false, true, false], 'checkbox states including uppercase X')
  const lists = nodes(page, 'list')
  t.equal(lists.length, 2, 'top-level and child task list')
  t.equal(lists[0]?.children.length, 4, 'four top-level tasks')
  t.equal(lists[0]?.children[3]?.children[1]?.children.length, 2, 'child tasks belong to the parent task')
  t.equal(lists[1]?.children[0]?.children[0]?.children[0]?.value, 'A completed child', 'checkbox removed from task content')
})

fixture('lists/custom-task-markers', (t, page) => {
  t.deepEqual(page.tasks().map((item) => item.json().checked), [true, true, true, false], 'custom markers are checked')
  t.deepEqual(page.tasks().map((item) => item.json().taskMarker ?? null), ['?', '-', '!', null], 'custom markers survive serialization')
  t.deepEqual(page.tasks().map((item) => item.text()), [
    'Needs clarification', 'Cancelled task', 'Important task', 'Still incomplete'
  ], 'task text excludes markers')
})

fixture('quotes/simple-quote', (t, page) => {
  const quotes = nodes(page, 'blockquote')
  t.equal(quotes.length, 1, 'one blockquote')
  t.deepEqual(quotes[0]?.children.map((node) => node.type), ['paragraph', 'paragraph'], 'two quoted paragraphs')
  t.deepEqual(page.links().map((item) => [item.json().target, item.json().alias]), [['Another note', 'a link']], 'link inside quote')
  t.equal(nodes(page, 'strong').length, 1, 'formatting inside quote')
  t.equal(page.ast().children[1]?.type, 'paragraph', 'final paragraph stays outside quote')
  t.equal(page.callouts().length, 0, 'ordinary quote is not a callout')
})

fixture('quotes/nested-quotes', (t, page) => {
  const quotes = nodes(page, 'blockquote')
  t.equal(quotes.length, 2, 'outer and inner quote')
  t.deepEqual(quotes[0]?.children.map((node) => node.type), ['paragraph', 'blockquote', 'paragraph'], 'outer quote resumes after inner quote')
  t.deepEqual(quotes[1]?.children.map((node) => node.type), ['paragraph', 'list'], 'list remains in inner quote')
  t.deepEqual(page.lists()[0]?.json().items.map((item) => item.text), ['First quoted item', 'Second quoted item'], 'nested list content')
})

import { fixture, nodes, values } from '../fixture.ts'

fixture('blocks/paragraph-block', (t, page) => {
  const block = page.blocks().find((item) => item.json().blockId === 'paragraph-id')
  t.equal(block?.text(), 'A paragraph that can be linked to.', 'block ID excluded from paragraph text')
  t.deepEqual(values(page, 'blockId'), ['paragraph-id'], 'one block marker')
  t.deepEqual(page.links().map((item) => [item.json().target, item.json().block, item.json().alias]), [
    ['', 'paragraph-id', 'Back to the paragraph']
  ], 'local block link')
})

fixture('blocks/quote-block', (t, page) => {
  t.equal(nodes(page, 'blockquote')[0]?.blockId, 'quote-id', 'standalone ID labels preceding quote')
  t.equal(nodes(page, 'blockquote')[0]?.children.length, 2, 'both quoted paragraphs retained')
  t.equal(page.links()[0]?.json().block, 'quote-id', 'link to quotation')
  t.deepEqual(values(page, 'blockId'), ['quote-id'], 'one marker')
})

fixture('blocks/list-item-block', (t, page) => {
  const block = page.blocks().find((item) => item.json().blockId === 'first-item')
  t.equal(block?.text(), 'The first item has an identifier.', 'addressable item content')
  t.equal(page.lists()[0]?.json().items.length, 2, 'two list items')
  t.deepEqual(values(page, 'blockId'), ['first-item'], 'one marker within list')
  t.equal(page.links()[0]?.json().block, 'first-item', 'link references first item')
})

fixture('callouts/simple-callout', (t, page) => {
  t.deepEqual(page.callouts().map((item) => {
    const { calloutType, title, fold } = item.json()
    return { calloutType, title, fold }
  }), [
    { calloutType: 'note', title: '', fold: null },
    { calloutType: 'tip', title: 'A custom title', fold: null }
  ], 'default and explicit titles')
  t.equal(nodes(page, 'strong').length, 1, 'formatting in custom title')
  t.deepEqual(page.links().map((item) => [item.json().target, item.text()]), [['Note', 'a link']], 'body wikilink')
  t.equal(nodes(page, 'callout')[0]?.children[0]?.children[0]?.value, 'A callout with its default title.', 'default-title callout body')
})

fixture('callouts/foldable-callouts', (t, page) => {
  t.deepEqual(page.callouts().map((item) => {
    const { calloutType, title, fold } = item.json()
    return [calloutType, title, fold]
  }), [
    ['faq', 'Initially collapsed', 'collapsed'], ['example', 'Initially expanded', 'expanded']
  ], 'fold markers and titles')
  t.deepEqual(nodes(page, 'callout').map((node) => node.children[0]?.children[0]?.value), [
    'The answer is hidden until expanded.', 'The example is visible immediately.'
  ], 'fold state does not remove content')
})

fixture('callouts/nested-callouts', (t, page) => {
  t.deepEqual(page.callouts().map((item) => [item.json().calloutType, item.json().title]), [
    ['question', 'Outer question'], ['tip', 'Inner tip']
  ], 'nested callout types and titles')
  t.deepEqual(nodes(page, 'callout')[0]?.children.map((node) => node.type), ['paragraph', 'callout', 'paragraph'], 'nested callout remains inside outer body')
  t.equal(nodes(page, 'callout')[0]?.children[2]?.children[0]?.value, 'The outer callout continues.', 'outer body resumes')
  t.equal(nodes(page, 'strong')[0]?.children[0]?.value, 'emphasis', 'nested body formatting')
})

fixture('callouts/title-only', (t, page) => {
  t.deepEqual(page.callouts().map((item) => {
    const { calloutType, title, fold } = item.json()
    return [calloutType, title, fold]
  }), [
    ['warning', 'A title without a body', null],
    ['custom-type', 'A custom callout type', 'expanded']
  ], 'title-only and custom callouts')
  t.deepEqual(nodes(page, 'callout').map((node) => node.children.length), [0, 0], 'no invented body paragraphs')
})

fixture('comments/inline-comment', (t, page) => {
  t.deepEqual(page.comments().map((item) => item.json().value), [
    'a hidden comment', '[[Not a link]] and ==not a highlight=='
  ], 'comments preserve literal contents')
  t.equal(page.links().length, 0, 'no links parsed inside comments')
  t.equal(page.highlights().length, 0, 'no highlights parsed inside comments')
  t.deepEqual(page.paragraphs().map((item) => item.text()), [
    'Visible text  continues here.', 'Before  after.'
  ], 'visible text excludes comments without normalizing spaces')
})

fixture('comments/block-comment', (t, page) => {
  t.deepEqual(page.comments().map((item) => item.json().value), [
    '\n# A hidden heading\n\n- A hidden list\n- [[A hidden link]]\n\n**Hidden formatting**\n'
  ], 'comment spans blank lines and retains literal Markdown')
  t.equal(page.headings().length, 0, 'hidden heading not parsed')
  t.equal(page.lists().length, 0, 'hidden list not parsed')
  t.equal(page.links().length, 0, 'hidden link not parsed')
  t.equal(nodes(page, 'strong').length, 0, 'hidden emphasis not parsed')
  t.deepEqual(page.paragraphs().map((item) => item.text()), ['Before the comment.', 'After the comment.'], 'surrounding content retained')
})

fixture('highlights/inline-highlights', (t, page) => {
  t.deepEqual(page.highlights().map((item) => item.text()), [
    'highlighted text', 'Bold inside a highlight', 'a highlighted link', 'A highlight containing == as code'
  ], 'highlight content')
  t.equal(nodes(page, 'strong')[0]?.children[0]?.value, 'Bold inside a highlight', 'nested bold')
  t.deepEqual(page.links().map((item) => [item.json().target, item.json().alias]), [['Note', 'a highlighted link']], 'nested wikilink')
  t.deepEqual(values(page, 'inlineCode'), ['=='], 'code delimiter does not close the highlight')
})

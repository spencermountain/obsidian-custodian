import { fixture, nodes } from '../fixture.ts'

fixture('links/wiki-alias', (t, page) => {
  t.deepEqual(page.links().map((item) => {
    const { target, alias, text } = item.json()
    return { target, alias, text }
  }), [
    { target: 'Three laws of motion', alias: "Newton's laws", text: "Newton's laws" },
    { target: 'Physics/Motion', alias: 'the motion note', text: 'the motion note' }
  ], 'destinations and displayed aliases')
  t.equal(page.embeds().length, 0, 'links are not embeds')
})

fixture('links/wiki-fragments', (t, page) => {
  t.deepEqual(page.links().map((item) => {
    const { target, heading, block, alias } = item.json()
    return { target, heading, block, alias }
  }), [
    { target: '', heading: 'Local heading', block: null, alias: null },
    { target: 'Physics/Motion', heading: 'Velocity#Examples', block: null, alias: 'Nested heading' },
    { target: 'Daily note', heading: null, block: 'summary', alias: 'Summary block' },
    { target: '', heading: null, block: 'local-block', alias: null }
  ], 'local, nested-heading, and block fragments')
})

fixture('links/external-and-titled', (t, page) => {
  t.deepEqual(page.links().map((item) => item.json().url), [
    'https://example.com', 'Notes/A note.md', 'mailto:hello@example.com'
  ], 'URL, angle-bracket path, and email destination')
  t.deepEqual(page.links().map((item) => item.text()), ['Example', 'a note with spaces', 'an email'], 'link labels')
  t.deepEqual(nodes(page, 'link').map((node) => node.title), ['An example website', null, null], 'optional link title')
})

fixture('links/reference-links', (t, page) => {
  t.deepEqual(page.links().map((item) => item.text()), ['the guide', 'details', 'reference'], 'reference labels')
  t.deepEqual(nodes(page, 'linkReference').map((node) => [node.identifier, node.referenceType]), [
    ['guide', 'full'], ['details', 'collapsed'], ['reference', 'shortcut']
  ], 'three reference-link forms')
  t.deepEqual(nodes(page, 'definition').map((node) => [node.identifier, node.url, node.title]), [
    ['guide', 'https://example.com/guide', 'The guide'],
    ['details', 'https://example.com/details', null],
    ['reference', 'https://example.com/reference', null]
  ], 'reference destinations and title')
})

fixture('links/autolinks', (t, page) => {
  t.deepEqual(page.links().map((item) => item.json().url), [
    'https://example.com/path?query=value', 'mailto:hello@example.com',
    'https://example.com', 'http://www.example.com', 'mailto:hello@example.com'
  ], 'angle-bracket and GFM autolinks')
  t.equal(page.links()[4]?.text(), 'hello@example.com', 'sentence punctuation excluded from email')
})

fixture('embeds/image-width', (t, page) => {
  t.equal(page.embeds().length, 1, 'one embed')
  const image = page.embeds()[0]?.json()
  t.equal(image?.target, 'Photos/Landscape.jpg', 'image path')
  t.equal(image?.width, 640, 'explicit width')
  t.equal(image?.height, undefined, 'height unspecified')
  t.equal(page.links().length, 0, 'embed is not a link')
})

fixture('embeds/embed-heading', (t, page) => {
  t.equal(page.embeds().length, 1, 'one embed')
  const embed = page.embeds()[0]?.json()
  t.equal(embed?.target, 'Physics/Motion', 'note path')
  t.equal(embed?.heading, 'Velocity', 'heading fragment')
  t.equal(embed?.block, null, 'not a block fragment')
})

fixture('embeds/external-image-size', (t, page) => {
  t.equal(page.embeds().length, 1, 'one external image')
  const image = page.embeds()[0]?.json()
  t.equal(image?.url, 'https://example.com/landscape.jpg', 'image destination')
  t.equal(image?.alt, 'Landscape|640x480', 'alt text retains size syntax')
  t.equal(image?.width, 640, 'width')
  t.equal(image?.height, 480, 'height')
  t.equal(nodes(page, 'image')[0]?.title, 'A landscape', 'image title')
})

fixture('embeds/reference-image', (t, page) => {
  t.equal(page.embeds().length, 1, 'one reference image')
  t.equal(page.embeds()[0]?.json().alt, 'A landscape', 'image alt text')
  t.equal(nodes(page, 'imageReference')[0]?.identifier, 'landscape', 'reference identifier')
  t.deepEqual(nodes(page, 'definition').map((node) => [node.identifier, node.url, node.title]), [
    ['landscape', 'https://example.com/landscape.jpg', 'A landscape']
  ], 'image reference destination')
  t.equal(page.links().length, 0, 'reference image is not a link')
})

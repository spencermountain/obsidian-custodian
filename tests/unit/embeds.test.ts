import { nodes } from '../_lib.ts'
import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'
const here = '[embeds] '
const examples = [
  ['audio', { type: 'embed', target: 'Excerpt from Mother of All Demos (1968).ogg', alias: null, heading: null, block: null }],
  ['embed-list', { type: 'embed', target: '../with-block', block: 'my-list-id', heading: null }],
  ['embed-page', { type: 'embed', target: 'Internal links', heading: null, block: null }],
  ['external-img', {
    type: 'image', alt: '250', width: 250,
    url: 'https://publish-01.obsidian.md/access/f786db9fac45774fa4f0d8112e232d67/Attachments/Engelbart.jpg'
  }],
  ['image-size', { type: 'embed', target: 'Engelbart.jpg', alias: '100x145', width: 100, height: 145 }],
  ['pdf', { type: 'embed', target: 'Document.pdf', heading: 'page=3', block: null }],
  ['simple-image', { type: 'embed', target: 'Engelbart.jpg', alias: null, heading: null, block: null }]
]

examples.forEach(([name, expected]) => {
  test(`embeds/${name}`, (t) => {
    const md = readFile(`embeds/${name}`)
    const page = parsePage(md)
    const embeds = page.embeds().map((embed) => embed.json())

    t.equal(embeds.length, 1, `${here} ${name} one-embed`)
    Object.entries(expected).forEach(([key, value]) => {
      t.equal(embeds[0]?.[key], value, `${here} ${name} ${key}`)
    })
    t.equal(page.links().length, 0, `${here} ${name} not-a-link`)
    t.deepEqual(page.json().embeds, embeds, `${here} ${name} json-embeds`)
    t.equal(page.markdown(), md, `${here} ${name} output-same`)
    t.end()
  })
})

test('embeds/image-width', (t) => {
  const input = readFile('embeds/image-width')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(page.embeds().length, 1, 'one embed')
  const image = page.embeds()[0]?.json()
  t.equal(image?.target, 'Photos/Landscape.jpg', 'image path')
  t.equal(image?.width, 640, 'explicit width')
  t.equal(image?.height, undefined, 'height unspecified')
  t.equal(page.links().length, 0, 'embed is not a link')
  t.end()
})

test('embeds/image-width - serialized and reparsed', (t) => {
  const input = readFile('embeds/image-width')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(page.embeds().length, 1, 'one embed')
  const image = page.embeds()[0]?.json()
  t.equal(image?.target, 'Photos/Landscape.jpg', 'image path')
  t.equal(image?.width, 640, 'explicit width')
  t.equal(image?.height, undefined, 'height unspecified')
  t.equal(page.links().length, 0, 'embed is not a link')
  t.end()
})

test('embeds/embed-heading', (t) => {
  const input = readFile('embeds/embed-heading')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(page.embeds().length, 1, 'one embed')
  const embed = page.embeds()[0]?.json()
  t.equal(embed?.target, 'Physics/Motion', 'note path')
  t.equal(embed?.heading, 'Velocity', 'heading fragment')
  t.equal(embed?.block, null, 'not a block fragment')
  t.end()
})

test('embeds/embed-heading - serialized and reparsed', (t) => {
  const input = readFile('embeds/embed-heading')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(page.embeds().length, 1, 'one embed')
  const embed = page.embeds()[0]?.json()
  t.equal(embed?.target, 'Physics/Motion', 'note path')
  t.equal(embed?.heading, 'Velocity', 'heading fragment')
  t.equal(embed?.block, null, 'not a block fragment')
  t.end()
})

test('embeds/external-image-size', (t) => {
  const input = readFile('embeds/external-image-size')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(page.embeds().length, 1, 'one external image')
  const image = page.embeds()[0]?.json()
  t.equal(image?.url, 'https://example.com/landscape.jpg', 'image destination')
  t.equal(image?.alt, 'Landscape|640x480', 'alt text retains size syntax')
  t.equal(image?.width, 640, 'width')
  t.equal(image?.height, 480, 'height')
  t.equal(nodes(page, 'image')[0]?.title, 'A landscape', 'image title')
  t.end()
})

test('embeds/external-image-size - serialized and reparsed', (t) => {
  const input = readFile('embeds/external-image-size')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(page.embeds().length, 1, 'one external image')
  const image = page.embeds()[0]?.json()
  t.equal(image?.url, 'https://example.com/landscape.jpg', 'image destination')
  t.equal(image?.alt, 'Landscape|640x480', 'alt text retains size syntax')
  t.equal(image?.width, 640, 'width')
  t.equal(image?.height, 480, 'height')
  t.equal(nodes(page, 'image')[0]?.title, 'A landscape', 'image title')
  t.end()
})

test('embeds/reference-image', (t) => {
  const input = readFile('embeds/reference-image')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(page.embeds().length, 1, 'one reference image')
  t.equal(page.embeds()[0]?.json().alt, 'A landscape', 'image alt text')
  t.equal(nodes(page, 'imageReference')[0]?.identifier, 'landscape', 'reference identifier')
  t.deepEqual(nodes(page, 'definition').map((node) => [node.identifier, node.url, node.title]), [
    ['landscape', 'https://example.com/landscape.jpg', 'A landscape']
  ], 'image reference destination')
  t.equal(page.links().length, 0, 'reference image is not a link')
  t.end()
})

test('embeds/reference-image - serialized and reparsed', (t) => {
  const input = readFile('embeds/reference-image')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(page.embeds().length, 1, 'one reference image')
  t.equal(page.embeds()[0]?.json().alt, 'A landscape', 'image alt text')
  t.equal(nodes(page, 'imageReference')[0]?.identifier, 'landscape', 'reference identifier')
  t.deepEqual(nodes(page, 'definition').map((node) => [node.identifier, node.url, node.title]), [
    ['landscape', 'https://example.com/landscape.jpg', 'A landscape']
  ], 'image reference destination')
  t.equal(page.links().length, 0, 'reference image is not a link')
  t.end()
})

test('PDF fragments expose page and height options', (t) => {
  const page = parsePage('![[Document.pdf#page=3&height=400]]')
  t.equal(page.embeds()[0]?.json().page, 3)
  t.equal(page.embeds()[0]?.json().height, 400)
  page.append('')
  t.equal(parsePage(page.markdown()).embeds()[0]?.json().page, 3)
  t.end()
})

test('reference images resolve URLs and PDF fields reject non-numbers', (t) => {
  const page = parsePage('![Alt][image]\n\n[image]: https://example.com/image.png "Caption"\n\n![[Document.pdf#page=oops&height=-1]]')
  t.equal(page.embeds()[0]?.json().url, 'https://example.com/image.png')
  t.equal(page.embeds()[0]?.json().title, 'Caption')
  t.equal(page.embeds()[1]?.json().page, undefined)
  t.equal(page.embeds()[1]?.json().height, undefined)
  t.end()
})

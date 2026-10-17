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

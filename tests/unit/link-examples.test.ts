import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'
const here = '[links] '
const examples = [
  ['wiki-link', { target: 'Three laws of motion', text: 'Three laws of motion', heading: null }],
  ['link-anchor', { target: 'About Obsidian', heading: 'Links are first-class citizens' }]
]

examples.forEach(([name, expected]) => {
  test(`links/${name}`, (t) => {
    const md = readFile(`links/${name}`)
    const page = parsePage(md)
    const links = page.links().map((link) => link.json())

    t.equal(links.length, 1, `${here} ${name} one-link`)
    t.equal(links[0]?.type, 'wikiLink', `${here} ${name} wiki-type`)
    t.equal(links[0]?.alias, null, `${here} ${name} no-alias`)
    t.equal(links[0]?.block, null, `${here} ${name} no-block`)
    Object.entries(expected).forEach(([key, value]) => {
      t.equal(links[0]?.[key], value, `${here} ${name} ${key}`)
    })
    t.equal(page.embeds().length, 0, `${here} ${name} not-an-embed`)
    t.deepEqual(page.json().links, links, `${here} ${name} json-links`)
    t.equal(page.markdown(), md, `${here} ${name} output-same`)
    t.end()
  })
})

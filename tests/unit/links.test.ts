import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'
const here = '[links] '

test('misc-link', (t) => {
  const md = `hello [[world]]`
  const page = parsePage(md)

  t.equal(page.links().length, 1, `${here} link-len`)
  t.equal(page.headings().length, 0, `${here} zero-headings`)

  const json = page.json()
  t.equal(json.links.length, 1, `${here} json-link-len`)

  t.equal(page.markdown(), md, `${here} output-same`)

  t.end()
})

test('links/markdown-link', (t) => {
  const md = readFile('links/markdown-link')
  const page = parsePage(md)
  t.equal(page.links().length, 2, `${here} two-links`)
  const json = page.json()
  t.equal(json.links?.[0].text, 'Three laws of motion', `${here} link-text-1`)
  t.equal(json.links?.[1].text, 'More laws of motion', `${here} link-text-2`)

  t.end()
})

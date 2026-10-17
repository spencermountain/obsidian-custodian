import test from 'tape'
import parsePage from '../lib.js'
import readFile from '../examples/index.js'
const here = '[tables] '
const examples = [
  ['simple-table', {
    align: [null, null],
    rows: [['First name', 'Last name'], ['Max', 'Planck'], ['Marie', 'Curie']]
  }],
  ['aligned-table', {
    align: ['left', 'center', 'right'],
    rows: [['Left-aligned text', 'Center-aligned text', 'Right-aligned text'], ['Content', 'Content', 'Content']]
  }]
]

examples.forEach(([name, expected]) => {
  test(`tables/${name}`, (t) => {
    const md = readFile(`tables/${name}`)
    const page = parsePage(md)
    const tables = page.tables().map((table) => table.json())

    t.equal(tables.length, 1, `${here} ${name} one-table`)
    t.deepEqual(tables[0]?.align, expected.align, `${here} ${name} alignment`)
    t.deepEqual(tables[0]?.rows, expected.rows, `${here} ${name} rows`)
    t.deepEqual(page.json().tables, tables, `${here} ${name} json-tables`)
    t.equal(page.markdown(), md, `${here} ${name} output-same`)
    t.end()
  })
})

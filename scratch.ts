import custodian from './src/index.ts'

// const input = `hello [[world#cool]]
//
//
//   [Label](<https://example.com>)
//
// ![[path/to/myFile.jpg]]
//
//
// ---
//
//
// - [ ] go to work
// - [x] brush teeth
//
// [[links]], ![[embeds]], ==highlights==,  %%comments%%
//
// `

// const page = custodian(input)
// page.tasks()[0].checked = true
// console.log(page.html())

const input = `# Old title

[[Note|Label]]

- [ ] Write a draft
`
const page = custodian(input)

page.headings()[0].update({ text: 'New title', depth: 2 })
page.links()[0].update({ target: 'Another note', alias: 'Read more' })
page.tasks()[0].update({ checked: true })
page.append('\nA final paragraph.')

console.log(page.markdown())

// console.log(page.json({}))
// console.log(page.embeds()[0].text())

/*
 * blocks
 * paragraphs
 * headings
 * links
 * embed
 * tasks
 * lists
 * callouts
 * highlights
 * comments
 * code
 * math
 * tables
 * frontmatter
 * footnotes
 */

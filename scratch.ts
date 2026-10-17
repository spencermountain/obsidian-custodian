import parsePage from './src/index.ts'

const input = `hello [[world]]

![[path/to/myFile.jpg]]

[[links]], ![[embeds]], ==highlights==, and %%comments%%
`

const page = parsePage(input)

console.log(page.json({}))
console.log(page.text())

/*
 * blocks
 * headings
 * paragraphs
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

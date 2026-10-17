import parsePage from './src/index.ts'

const input = `hello [[world#cool]]


  [Label](<https://example.com>)

![[path/to/myFile.jpg]]





- [ ] go to work
- [x] brush teeth

[[links]], ![[embeds]], ==highlights==,  %%comments%%

`

const page = parsePage(input)
page.links()[1].title = 'farming'
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

import parsePage from './src/index.js'

const input = `hello [[world]]

![[path/to/myFile.jpg]]`

const page = parsePage(input)

// Outputs
const json = page.json()
console.log(json)
// const md = page.markdown()
// console.log(md)
// const ast = page.ast()
// console.log(ast)
//
// // API
// page.headings().forEach((heading) => {
//   console.log(heading.json())
// })

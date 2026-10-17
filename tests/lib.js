import process from 'node:process'

// Load only the implementation selected by the test command.
const implementations = {
  src: '../src/index.js',
  prod: '../builds/obsidian-parser.mjs'
}
const path = implementations[process.env.TESTENV] || implementations.src
const { default: parsePage } = await import(path)

export default parsePage

// Load only the implementation selected by the test command.
const implementations = {
  src: '../../src/index.js',
  prod: '../../builds/obsidian-parser.mjs'
}
const path = implementations[process.env.TESTENV] || implementations.src
const { default: spacetime } = await import(path)

export default spacetime
